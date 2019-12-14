import { AppSettings } from './../../services/app-settings';
import { ViewerControlsService, ViewerActions } from '../../services/viewer-controls.service';
import { BookService, ViewerData, ViewerImageType } from './../../services/book.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { interval } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { KrameriusInfoService } from '../../services/kramerius-info.service';
import { KrameriusApiService } from '../../services/kramerius-api.service';
import { HttpClient } from '@angular/common/http';
import { forkJoin} from 'rxjs/observable/forkJoin';
import { IiifService } from '../../services/iiif.service';
import { ZoomifyService } from '../../services/zoomify.service';
import { AltoService } from '../../services/alto-service';
import { LoggerService } from '../../services/logger.service';

declare var ol: any;

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html'
})
export class ViewerComponent implements OnInit, OnDestroy {
  
  private view;
  private imageLayer;
  private zoomifyLayer;
  private imageLayer2;
  private zoomifyLayer2;
  private vectorLayer;
  private watermark;
  private extent;

  private imageWidth = 0;
  private imageWidth1 = 0;
  private imageHeight = 0;

  private lastRotateTime = 0;

  private viewerActionsSubscription: Subscription;
  private pageSubscription: Subscription;
  private intervalSubscription: Subscription;

  public hideOnInactivity = false;
  public lastMouseMove = 0;

  private selectionInteraction;
  private selectionType: SelectionType;

  private data: ViewerData;

  public imageLoading = false;

  ngOnInit() {
    this.init();
    this.logger.info('ViewerComponent init')
    this.pageSubscription = this.bookService.watchViewerData().subscribe(
      (data: ViewerData) => {
        this.updateImage(data);
      }
    );
    this.updateImage(this.bookService.getViewerData());
    this.intervalSubscription = interval(4000).subscribe( () => {
      const lastMouseDist = new Date().getTime() - this.lastMouseMove;
      if (lastMouseDist >= 4000) {
        this.hideOnInactivity = true;
      }
    });
  }


  constructor(public bookService: BookService,
              public authService: AuthService,
              public appSettings: AppSettings,
              private http: HttpClient,
              private iiif: IiifService,
              private logger: LoggerService,
              private zoomify: ZoomifyService,
              private alto: AltoService,
              private krameriusApi: KrameriusApiService,
              public krameriusInfo: KrameriusInfoService,
              public controlsService: ViewerControlsService) {
    this.viewerActionsSubscription = this.controlsService.viewerActions().subscribe((action: ViewerActions) => {
        this.onActionPerformed(action);
    });
  }


  init() {
    const mainStyle = new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(244, 81, 30, 0.20)'
      }),
      stroke: new ol.style.Stroke({
        color: '#F4511E',
        width: 2
      })
    });
    this.vectorLayer = new ol.layer.Vector({
      name: 'vectorlayer',
      source: new ol.source.Vector(),
      style: mainStyle
    });
    const interactions = ol.interaction.defaults({ keyboardPan: false, pinchRotate: false });
    this.view = new ol.Map({
      target: 'app-viewer',
      controls: [],
      interactions: interactions,
      loadTilesWhileAnimating: true,
      layers: [this.vectorLayer]
    });

    this.selectionInteraction = new ol.interaction.DragBox({});

    this.selectionInteraction.on('boxend', () => {
      this.view.removeInteraction(this.selectionInteraction);
      this.view.getViewport().style.cursor = '';
      let extent = this.selectionInteraction.getGeometry().getExtent();
      if (this.imageWidth1 > 0) {
        // double page;
        const startExtentX = extent[0];
        if (-this.imageWidth / 2 + this.imageWidth1 > startExtentX) {
          extent = [extent[0] + this.imageWidth1, extent[1], extent[2] + this.imageWidth1, extent[3]];
          this.onSelectionEnd(extent, this.imageWidth1, this.imageHeight, false);
        } else {
          const offset = this.imageWidth / 2 - this.imageWidth1;
          extent = [extent[0] + offset, extent[1], extent[2] + offset, extent[3]];
          this.onSelectionEnd(extent, this.imageWidth - this.imageWidth1, this.imageHeight, true);
        }
      } else {
        this.onSelectionEnd(extent, this.imageWidth, this.imageHeight, false);
      }
    });
  }


  onSelectionStart(type: SelectionType) {
    this.selectionType = type;
    this.view.addInteraction(this.selectionInteraction);
    this.view.getViewport().style.cursor = 'crosshair';
  }

  onSelectionEnd(extent, width: number, height: number, right: boolean) {
    this.view.removeInteraction(this.selectionInteraction);
    if (this.selectionType === SelectionType.textSelection) {
      this.bookService.showTextSelection(extent, width, height, right);
    } else if (this.selectionType === SelectionType.imageSelection) {
      this.bookService.showImageCrop(extent, right);
    }
  }

  onMouseMove() {
    this.lastMouseMove = new Date().getTime();
    this.hideOnInactivity = false;
  }


  private onActionPerformed(action: ViewerActions) {
    switch (action) {
      case ViewerActions.zoomIn:
        this.zoomIn();
        break;
      case ViewerActions.zoomOut:
        this.zoomOut();
        break;
      case ViewerActions.rotateRight:
        this.rotateRight();
        break;
      case ViewerActions.rotateLeft:
        this.rotateLeft();
        break;
      case ViewerActions.fitToScreen:
        this.fitToScreen();
        break;
      case ViewerActions.selectText:
        this.onSelectionStart(SelectionType.textSelection);
        break;
      case ViewerActions.cropImage:
        this.onSelectionStart(SelectionType.imageSelection);
        break;
    }
  }

  private zoomIn() {
    const currentZoom = this.view.getView().getResolution();
    let newZoom = currentZoom / 1.5;
    this.view.getView().animate({
      resolution: newZoom,
      duration: 300
    });
  }

  private zoomOut() {
    const currentZoom = this.view.getView().getResolution();
    let newZoom = currentZoom * 1.5;
    this.view.getView().animate({
      resolution: newZoom,
      duration: 300
    });
  }

  private rotateRight() {
    this.rotate(Math.PI / 2);
  }

  private rotateLeft() {
    this.rotate(- Math.PI / 2);
  }

  private rotate(angle: number) {
    const timestamp = new Date().getTime();
    const currentRotation = this.view.getView().getRotation();
    if (timestamp - this.lastRotateTime < 550) {
      return;
    }
    this.view.getView().animate({
      rotation: currentRotation + angle,
      duration: 500
    });
    this.lastRotateTime = timestamp;
  }

  private fitToScreen() {
    this.view.getView().setRotation(0);
    this.view.getView().fit(this.extent);
  }

  updateBoxes() {
    this.vectorLayer.getSource().clear();
    if (!this.data.query) {
      return;
    }
    this.krameriusApi.getAlto(this.data.uuid1).subscribe(response => {
          const boxes = this.alto.getBoxes(response, this.data.query, this.imageWidth, this.imageHeight);
          for (let i = 0; i < boxes.length; i++) {
            const ring = boxes[i];
            const polygon = new ol.geom.Polygon([ring]);
            const feature = new ol.Feature(polygon);
            this.vectorLayer.getSource().addFeature(feature);
          }
          this.view.addLayer(this.vectorLayer);
     });
  }

  buildWatermarkLayer(text: string) {
    const font = '13px roboto,sans-serif';
    this.watermark = new ol.layer.Vector({
      name: 'watermark',
      source: new ol.source.Vector(),
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(244, 81, 30, 0.20)'
        }),
        stroke: new ol.style.Stroke({
          color: '#F4511E',
          width: 2
        }),
        text: new ol.style.Text({
          font: font,
          text: text,
          fill: new ol.style.Fill({
            color: 'rgba(0, 0, 0, 0.2)'
          }),
          textAlign: 'left',
        })
      })
    });
    this.watermark.setZIndex(100);
    this.view.addLayer(this.watermark);
  }

  addWaterMark() {
    if (this.watermark) {
      this.watermark.getSource().clear();
    }
    let watermarkText: string;
    if (this.bookService.dnntMode && this.authService.isLoggedIn()) {
      watermarkText = this.authService.user.name;
    } else {
      // watermarkText = 'Josef Novák';
    }
    if (!watermarkText) {
      return;
    }
    if (!this.watermark) {
      this.buildWatermarkLayer(watermarkText);
    }
    let cw = 3;
    const ch = 4;
    const sw = this.extent[0];
    const width = this.extent[2] - this.extent[0];
    if (this.extent[0] < 0) {
      cw = 6;
    }
    const height = -this.extent[1];
    for (let i = 0; i < cw; i ++) {
     for (let j = 0; j < ch; j ++) {
       const x = sw + (i/(cw*1.0))*width + width/20.0;
       const y = (j/(ch*1.0)) * height + height/30.0*i + 70;
       var point = new ol.Feature(new ol.geom.Point([x, -y]));
        this.watermark.getSource().addFeature(point);
     }
    }
  }

  updateJpegImage(uuid1: string, uuid2: string) {
    this.onImageLoading();
    const rq = [];
    rq.push(this.http.head(this.krameriusApi.getScaledJpegUrl(uuid1, 3000)));
    if (uuid2) {
      rq.push(this.http.head(this.krameriusApi.getScaledJpegUrl(uuid1, 3000)));
    }
    forkJoin(rq).subscribe(
      (results) => {
        this.loadJpegImage(uuid1, uuid2, true, false)
      },
      (error) => {
        this.onImageFailure();
        if (error && error.status === 403) {
          this.bookService.onInaccessibleImage();
        }
      }
    );
  }
  
  loadJpegImage(uuid1: string, uuid2: string, left: boolean, thumb: boolean) {
    const uuid = left ? uuid1 : uuid2;
    const url = this.krameriusApi.getScaledJpegUrl(uuid, 3000);
    const image = new Image();
    image.onload = (() => {
        if (left && uuid2) {
          this.imageWidth = image.width;
          this.imageHeight = image.height;
          this.loadJpegImage(uuid1, uuid2, false, thumb);
        } else {
          if (!left) {
            this.setDimensions(this.imageWidth, this.imageHeight, image.width, image.height);
            const url1 = this.krameriusApi.getScaledJpegUrl(uuid1, 3000);
            const thumb1 = this.krameriusApi.getThumbUrl(uuid1);
            this.addStaticImage(this.imageWidth, this.imageHeight, thumb ? thumb1 : url1, 1);
            const url2 = url;
            const thumb2 = this.krameriusApi.getThumbUrl(uuid2);
            this.addStaticImage(image.width, image.height, thumb ? thumb2 : url2,  2);
          } else {
            this.setDimensions(image.width, image.height, null, null);
            const thumb1 = this.krameriusApi.getThumbUrl(uuid1);
            this.addStaticImage(image.width, image.height, thumb ? thumb1 : url, 0);
          }
          this.onImageSuccess();
        }
    });
    image.onerror = ((error) => {
        this.onImageFailure();
        image.onerror = null;
        this.logger.info('on error', error);
    });
    image.src = url;
  }


  updateZoomifyImage(url1: string, url2: string) {
    this.onImageLoading();
    const rq = [];
    let w1, w2, h1, h2;
    rq.push(this.http.get(this.zoomify.properties(url1), { observe: 'response', responseType: 'text' }));
    if (url2) {
      rq.push(this.http.get(this.zoomify.properties(url2), { observe: 'response', responseType: 'text' }));
    }
    forkJoin(rq).subscribe((results) => {
      const p1 = this.zoomify.parseProperties(results[0].body);
      w1 = p1.width;
      h1 = p1.height;
      if (url2 && results.length > 1) {
        const p2 = this.zoomify.parseProperties(results[1].body);
        w2 = p2.width;
        h2 = p2.height;
      }
      this.setDimensions(w1, h1, w2, h2);
      if (url2 && results.length > 1) {
        this.addZoomifyImage(w1, h1, url1, 1);
        this.addZoomifyImage(w2, h2, url2, 2);
      } else {
        this.addZoomifyImage(w1, h1, url1, 0);
      }
      this.onImageSuccess();
    },
    (error)  => {
        this.onImageFailure();
        if (error && error.status === 403) {
          this.bookService.onInaccessibleImage();
        }
      }
    );
  }


  updateIiifImage(url1: string, url2: string) {
    this.onImageLoading();
    const rq = [];
    let w1, w2, h1, h2;
    rq.push(this.http.get(this.iiif.imageManifest(url1)));
    if (url2) {
      rq.push(this.http.get(this.iiif.imageManifest(url2)));
    }
    forkJoin(rq).subscribe((results) => {
      w1 = results[0].width;
      h1 = results[0].height;
      if (url2 && results.length > 1) {
        w2 = results[1].width;
        h2 = results[1].height;
      }
      this.setDimensions(w1, h1, w2, h2);
      if (url2 && results.length > 1) {
        this.addIIIFImage(results[0], w1, h1, url1, 1);
        this.addIIIFImage(results[1], w2, h2, url2, 2);
      } else {
        this.addIIIFImage(results[0], w1, h1, url1, 0);
      }
      this.onImageSuccess();
    },
    (error)  => {
        this.onImageFailure();
        if (error && error.status === 403) {
          this.bookService.onInaccessibleImage();
        }
      }
    );
  }

  onImageLoading() {
    if (this.watermark) {
      this.watermark.getSource().clear();
    }
    this.vectorLayer.getSource().clear();
    this.imageLoading = true;
  }

  onImageSuccess() {
    this.imageLoading = false;
    this.view.getView().fit(this.extent);
    this.updateBoxes();
    this.addWaterMark();
  }

  onImageFailure() {
    this.imageLoading = false;
  }

  setDimensions(width1: number, height1: number, width2: number, height2: number) {
    this.imageWidth1 = 0;
    this.imageWidth = width1;
    this.imageHeight = height1;
    let extent;
    if (width2 && height2) {
      this.imageHeight = Math.max(this.imageHeight, height2);
      this.imageWidth = width1 + width2;
      this.imageWidth1 = width1;
      extent = [-this.imageWidth / 2, -this.imageHeight, this.imageWidth / 2, 0];
    } else {
      extent = [0, -this.imageHeight, this.imageWidth, 0];
    }
    this.extent = extent;
    const maxResolution = this.getBestFitResolution() * 1.5;
    const minResolution = 0.5;
    const viewOpts: any = {
      extent: this.extent,
      minResolution: minResolution,
      maxResolution: maxResolution,
      constrainOnlyCenter: true,
      smoothExtentConstraint: false
    };
    const view = new ol.View(viewOpts);
    this.view.setView(view);
  }


  updateImage(data: ViewerData) {
    this.logger.info('updateImage', data);
    if (this.data && this.data.equals(data)) {
      return;
    }
    this.view.removeLayer(this.imageLayer);
    this.view.removeLayer(this.zoomifyLayer);
    this.view.removeLayer(this.imageLayer2);
    this.view.removeLayer(this.zoomifyLayer2);
    this.view.removeLayer(this.vectorLayer);

    this.data = data;
    switch (data.imageType) {
      case ViewerImageType.IIIF: 
        this.updateIiifImage(data.url1, data.url2);
        break;
      case ViewerImageType.ZOOMIFY: 
        this.updateZoomifyImage(data.url1, data.url2);
        break;
      case ViewerImageType.JPEG: 
        this.updateJpegImage(data.uuid1, data.uuid2);
        break;
    }
  }

  addIIIFImage(data, width, height, url, type) {
    let extent;
    if (type === 0) {
      extent = [0, -height, width, 0];
    } else if (type === 1) {
      extent = [-this.imageWidth / 2, -height, -this.imageWidth / 2 + width, 0];
    } else if (type === 2) {
      extent = [this.imageWidth / 2 - width, -height, this.imageWidth / 2, 0];
    }
    var options = new ol.format.IIIFInfo(data).getTileSourceOptions();
    if (options === undefined || options.version === undefined) {
      // Invalid IIIF
      return;
    }
    options.zDirection = -1;
    options.extent = extent;
    options.crossOrigin = 'Anonymous';
    const iiifTileSource = new ol.source.IIIF(options);
    const zLayer = new ol.layer.Tile({
      source: iiifTileSource,
    });
    const thumbUrl = this.iiif.image(url, options.sizes[0][0], options.sizes[0][1]);
    const iLayer = new ol.layer.Image({
      source: new ol.source.ImageStatic({
        url: thumbUrl,
        imageExtent: extent,
        crossOrigin: 'Anonymous'
      })
    });
    this.view.addLayer(iLayer);
    this.view.addLayer(zLayer);
    if (type === 2) {
      this.imageLayer2 = iLayer;
      this.zoomifyLayer2 = zLayer;
    } else {
      this.imageLayer = iLayer;
      this.zoomifyLayer = zLayer;
    }
  }

  addZoomifyImage(width, height, url, type) {
    let extent;
    if (type === 0) {
      extent = [0, -height, width, 0];
    } else if (type === 1) {
      extent = [-this.imageWidth / 2, -height, -this.imageWidth / 2 + width, 0];
    } else if (type === 2) {
      extent = [this.imageWidth / 2 - width, -height, this.imageWidth / 2, 0];
    }
    const zLayer = new ol.layer.Tile({
      source: new ol.source.Zoomify({
        tileSize: 256,
        tilePixelRatio: 1,
        url: url + '/',
        size: [width, height],
        tierSizeCalculation: 'truncated',
        crossOrigin: 'Anonymous',
        extent: extent
      })
    });    
    const iLayer = new ol.layer.Image({
      source: new ol.source.ImageStatic({
        url: this.zoomify.thumb(url),
        imageExtent: extent,
        crossOrigin: 'Anonymous'
      })
    });
    this.view.addLayer(iLayer);
    this.view.addLayer(zLayer);
    if (type === 2) {
      this.imageLayer2 = iLayer;
      this.zoomifyLayer2 = zLayer;
    } else {
      this.imageLayer = iLayer;
      this.zoomifyLayer = zLayer;
    }
  }


  addStaticImage(width, height, url, type) {
    let extent;
    if (type === 0) {
      extent = [0, -height, width, 0];
    } else if (type === 1) {
      extent = [-this.imageWidth / 2, -height, -this.imageWidth / 2 + width, 0];
    } else if (type === 2) {
      extent = [this.imageWidth / 2 - width, -height, this.imageWidth / 2, 0];
    }

    // const projection = new ol.proj.Projection({
    //   code: 'IMAGE',
    //   units: 'pixels',
    //   extent: extent
    // });
    const iLayer = new ol.layer.Image({
      source: new ol.source.ImageStatic({
        url: url,
        imageSize: [width, height],
        // projection: projection,
        imageExtent: extent,
        crossOrigin: 'Anonymous'
      })
    });

    this.view.addLayer(iLayer);
    if (type === 2) {
      this.imageLayer2 = iLayer;
    } else {
      this.imageLayer = iLayer;
    }
  }


  getBestFitResolution() {
    const rx = this.imageWidth / (this.view.getSize()[0] - 10);
    const ry = this.imageHeight / (this.view.getSize()[1] - 10);
    return Math.max(rx, ry);
  }

  ngOnDestroy() {
    if (this.viewerActionsSubscription) {
      this.viewerActionsSubscription.unsubscribe();
    }
    if (this.pageSubscription) {
      this.pageSubscription.unsubscribe();
    }
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
    this.view.removeLayer(this.imageLayer);
    this.view.removeLayer(this.zoomifyLayer);
    this.view.removeLayer(this.imageLayer2);
    this.view.removeLayer(this.zoomifyLayer2);
    this.view.removeLayer(this.vectorLayer);

  }

  today() {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return day + '.' + month + '.' + year;
  }

}

export enum SelectionType {
  imageSelection = 1,
  textSelection = 2
}

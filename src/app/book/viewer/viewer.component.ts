import { AppSettings } from './../../services/app-settings';
import { ViewerControlsService, ViewerActions } from '../../services/viewer-controls.service';
import { Page, PageImageType } from './../../model/page.model';
import { BookService } from './../../services/book.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { interval } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { KrameriusInfoService } from '../../services/kramerius-info.service';
import { KrameriusApiService } from '../../services/kramerius-api.service';

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

  ngOnInit() {
    this.init();
    this.pageSubscription = this.bookService.watchPage().subscribe(
      pages => {
        this.updateView(pages[0], pages[1]);
      }
    );
    const lPage = this.bookService.getPage();
    const rPage = this.bookService.getRightPage();
    if (lPage) {
      this.updateView(lPage, rPage);
    }
    this.intervalSubscription = interval(4000).subscribe( () => {
      const lastMouseDist = new Date().getTime() - this.lastMouseMove;
      if (lastMouseDist >= 4000) {
        this.hideOnInactivity = true;
      }
    });
  }

  constructor(public bookService: BookService,
              public authService: AuthService,
              public krameriusApi: KrameriusApiService,
              public appSettings: AppSettings,
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

  updateView(leftPage: Page, rightPage: Page) {
    const left = (leftPage && leftPage.url) ? leftPage : null;
    const right = (rightPage && rightPage.url) ? rightPage : null;
    this.updateImage(left, right);
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

  updateBoxes(data) {
    this.vectorLayer.getSource().clear();
    if (!data) {
      return;
    }
    for (let i = 0; i < data.length; i++) {
      const ring = data[i];
      const polygon = new ol.geom.Polygon([ring]);
      const feature = new ol.Feature(polygon);
      this.vectorLayer.getSource().addFeature(feature);
    }
    this.view.addLayer(this.vectorLayer);
  }

  updateImage(image1: Page, image2: Page) {
    this.view.removeLayer(this.imageLayer);
    this.view.removeLayer(this.zoomifyLayer);
    this.view.removeLayer(this.imageLayer2);
    this.view.removeLayer(this.zoomifyLayer2);
    this.view.removeLayer(this.vectorLayer);
    if (!image1) {
      return;
    }
    this.imageWidth1 = 0;
    this.imageWidth = image1.width;
    this.imageHeight = image1.height;
    let extent;
    if (image2 != null) {
      this.imageHeight = Math.max(this.imageHeight, image2.height);
      this.imageWidth = image1.width + image2.width;
      this.imageWidth1 = image1.width;
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

    if (image2 != null) {
      if (image1.imageType === PageImageType.ZOOMIFY) {
        // this.addZoomifyImage(image1.url, image1.width, image1.height, 1);
        this.addIIIFImage(image1.uuid, image1.width, image1.height, 1);
      } else {
         this.addStaticImage(image1.url, image1.width, image1.height, 1);
      }
      if (image2.imageType === PageImageType.ZOOMIFY) {
        // this.addZoomifyImage(image2.url, image2.width, image2.height, 2);
        this.addIIIFImage(image2.uuid, image2.width, image2.height, 2);
      } else {
         this.addStaticImage(image2.url, image2.width, image2.height, 2);
      }
    } else {
      if (image1.imageType === PageImageType.ZOOMIFY) {
        // this.addZoomifyImage(image1.url, image1.width, image1.height, 0);
        this.addIIIFImage(image1.uuid, image1.width, image1.height, 0);

      } else {
        this.addStaticImage(image1.url, image1.width, image1.height, 0);
      }
    }
    if (image1.altoBoxes) {
      this.updateBoxes(image1.altoBoxes);
    }
    this.fitToScreen();
    // this.view.getView().fit(extent);
  }

  addIIIFImage(uuid, width, height, type) {
    let extent;
    if (type === 0) {
      extent = [0, -height, width, 0];
    } else if (type === 1) {
      extent = [-this.imageWidth / 2, -height, -this.imageWidth / 2 + width, 0];
    } else if (type === 2) {
      extent = [this.imageWidth / 2 - width, -height, this.imageWidth / 2, 0];
    }
    this.krameriusApi.getIiifImageManifest(uuid).subscribe((imageInfo: any) => {
      var options = new ol.format.IIIFInfo(imageInfo).getTileSourceOptions();
      if (options === undefined || options.version === undefined) {
        // Invalid IIIF
        return;
      }
      options.zDirection = -1;
      options.extent = extent;
      const iiifTileSource = new ol.source.IIIF(options);
      const zLayer = new ol.layer.Tile({
        source: iiifTileSource
      });
      const thumbUrl = this.krameriusApi.getIiifImageFullUrl(uuid, options.sizes[0][0], options.sizes[0][1]);
      const iLayer = new ol.layer.Image({
        source: new ol.source.ImageStatic({
          url: thumbUrl,
          imageExtent: extent
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
      this.view.getView().fit(this.extent);
    });
  }

  addZoomifyImage(url, width, height, type) {
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
        url: url,
        size: [width, height],
        tierSizeCalculation: 'truncated',
        crossOrigin: 'anonymous',
        extent: extent
      })
    });    
    const iLayer = new ol.layer.Image({
      source: new ol.source.ImageStatic({
        url: url + 'TileGroup0/0-0-0.jpg',
        imageExtent: extent
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


  addStaticImage(url, width, height, type) {
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
        imageExtent: extent
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

import { AppSettings } from './../../services/app-settings';
import { ViewerControlsService, ViewerActions } from '../../services/viewer-controls.service';
import { BookService, ViewerData, ViewerImageType } from './../../services/book.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { interval } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { KrameriusInfoService } from '../../services/kramerius-info.service';
import { KrameriusApiService } from '../../services/kramerius-api.service';
import { HttpClient } from '@angular/common/http';
import { forkJoin} from 'rxjs';
import { IiifService } from '../../services/iiif.service';
import { ZoomifyService } from '../../services/zoomify.service';
import { AltoService } from '../../services/alto-service';
import { LoggerService } from '../../services/logger.service';
import { LicenceService } from '../../services/licence.service';
import { TtsService } from '../../services/tts.service';
import { PageImageType } from '../../model/page.model';

declare var ol: any;

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnInit, OnDestroy {
  
  private resolution = 1;
  private view;
  private imageLayer;
  private zoomifyLayer;
  private imageLayer2;
  private zoomifyLayer2;
  private vectorLayer;
  private selectionMenu;
  private selectionPosition;
  private selectionWidth;
  private selectionHeight;
  private selectionRight;
  private selectionHA;
  private selectionVA;
  private selectionExtent;
  private selectionModeOn = false;
  private maskLayer;

  private watermark;
  private extent;


  private imageWidth = 0;
  private imageWidth1 = 0;
  private imageHeight = 0;

  private lastRotateTime = 0;
  private lastTouchTime;
  private lastTouchX;
  private initialResolution;

  private viewerActionsSubscription: Subscription;
  private pageSubscription: Subscription;
  private ttsSubscription: Subscription;

  private intervalSubscription: Subscription;

  public hideOnInactivity = false;
  public firstHideOnInactivity = true;

  public lastMouseMove = 0;

  private selectionInteraction;
  private mouseWheelZoomInteraction;
  private dragPanInteraction;
  private doubleClickZoomInteraction;

  private data: ViewerData;

  public imageLoading = false;

  constructor(public bookService: BookService,
              public authService: AuthService,
              private tts: TtsService,
              public settings: AppSettings,
              public licences: LicenceService,
              private http: HttpClient,
              private iiif: IiifService,
              private logger: LoggerService,
              private zoomify: ZoomifyService,
              private alto: AltoService,
              private api: KrameriusApiService,
              public krameriusInfo: KrameriusInfoService,
              public controlsService: ViewerControlsService) {
    this.viewerActionsSubscription = this.controlsService.viewerActions().subscribe((action: ViewerActions) => {
        this.onActionPerformed(action);
    });
  }


  ngOnInit() {
    this.init();
    this.logger.info('ViewerComponent init')
    this.pageSubscription = this.bookService.watchViewerData().subscribe(
      (data: ViewerData) => {
        this.updateImage(data);
      }
    );
    this.ttsSubscription = this.tts.watchBlock().subscribe(
      (block: any) => {
        if (this.bookService.getPage().uuid == this.tts.readingPageUuid) {
          this.updateTtsBlock(block);
        }
      }
    );
    this.updateImage(this.bookService.getViewerData());
    this.lastMouseMove = new Date().getTime();
    this.intervalSubscription = interval(1000).subscribe( () => {
      const lastMouseDist = new Date().getTime() - this.lastMouseMove;
      const limit = this.firstHideOnInactivity ? 4000 : 500;
      if (lastMouseDist >= limit) {
        this.hideOnInactivity = true;
        this.firstHideOnInactivity = false;
      }
    });
  }


  mousewheelPan(e) {
    if (!this.bookService.zoomLockEnabled || this.view.getView().getResolution() >= this.initialResolution) {
      return
    }
    var event = e.originalEvent;
    var delta = event.deltaY;
    if(!delta) {
      delta = event.detail;
    }
    event.preventDefault();
    const view = this.view.getView();
    const panFactor = 12 * view.getResolution() * (delta > 0 ? -1 : 1);
    const center = view.getCenter();
    const coordinates = [center[0], center[1] + panFactor];
    view.setCenter(coordinates);
  }

  init() {
    this.selectionMenu = document.getElementById('selectionmenu');
    this.maskLayer = new ol.layer.Vector({
      source:  new ol.source.Vector(),
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(0, 0, 0, 0.85)' 
        })
      })
    });
    const mainStyle = new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(2, 119, 189, 0.20)'
      }),
      stroke: new ol.style.Stroke({
        color: '#0277bd',
        width: 0
      })
    });
    this.vectorLayer = new ol.layer.Vector({
      name: 'vectorlayer',
      source: new ol.source.Vector(),
      style: mainStyle
    });
    const interactions = ol.interaction.defaults({ 
      keyboardPan: false,
      pinchRotate: false,
      mouseWheelZoom: false,
      doubleClickZoom: false,
      dragPan: false
    });
    this.view = new ol.Map({
      target: 'app-viewer',
      controls: [],
      interactions: interactions,
      loadTilesWhileAnimating: true,
      layers: [this.vectorLayer]
    });
    this.view.on('wheel', (e) => {
      this.mousewheelPan(e);
    });
    setTimeout(() => {
      this.updateSize();
      if (!this.bookService.zoomLockEnabled) {
        this.view.addInteraction(this.mouseWheelZoomInteraction);
        this.view.addInteraction(this.doubleClickZoomInteraction);
      }
    }, 100);

    this.selectionInteraction = new ol.interaction.DragBox({});
    this.mouseWheelZoomInteraction = new ol.interaction.MouseWheelZoom({});
    this.doubleClickZoomInteraction = new ol.interaction.DoubleClickZoom({});
    this.dragPanInteraction = new ol.interaction.DragPan({});
    
    this.view.addInteraction(this.dragPanInteraction);
    const wl = 60000;
    this.dragPanInteraction.setActive(window.innerWidth > wl);

    this.view.on('pointerdown', (e) => {
      if (window.innerWidth > wl || this.view.getView().getResolution() != this.initialResolution) {
        return;
      }
      this.lastTouchTime = new Date().getTime();
      this.lastTouchX = e.pixel[0];
    });

    this.view.on('pointerup', (e) => {
      if (this.selectionModeOn || !this.lastTouchTime || !this.lastTouchX || this.view.getView().getResolution() != this.initialResolution) {
        return;
      }
      const deltaT = new Date().getTime() - this.lastTouchTime;
      const deltaX = this.lastTouchX - e.pixel[0];
      const deltaXabs = Math.abs(deltaX);
      const width = this.view.getSize()[0];
      const toLeft = deltaX < 0;
      if (deltaT < 600 && (deltaXabs > width / 3.0 || deltaXabs > 160)) {
        if (toLeft) {
          this.bookService.goToPrevious();
        } else {
          this.bookService.goToNext();
        }
      } 
    });

    this.view.on('moveend', (e) => {
      this.updateMenuPosition();
      if (this.bookService.zoomLockEnabled || this.view.getView().getResolution() < this.initialResolution) {
        this.dragPanInteraction.setActive(true);
      } else {
        this.dragPanInteraction.setActive(false);
        if (this.initialResolution) {
          this.view.updateSize();
          this.view.getView().fit(this.extent);
        }
      }
    })
  
    this.selectionInteraction.on('boxend', () => {
      let extent = this.selectionInteraction.getGeometry().getExtent();
      this.onBoxEnd(extent);
    });
  }


  private onBoxEnd(extent) {
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
      if (extent[0] < 0) {
        extent[0] = 0;
      }
      if (extent[2] > this.imageWidth) {
        extent[2] = this.imageWidth;
      }
      if (extent[1] < -this.imageHeight) {
        extent[1] = -this.imageHeight;
      }
      if (extent[3] > 0) {
        extent[3] = 0;
      }
      this.onSelectionEnd(extent, this.imageWidth, this.imageHeight, false);
    }
  }

  private toggleLock() {
    this.bookService.zoomLockEnabled = !this.bookService.zoomLockEnabled;
    if (this.bookService.zoomLockEnabled) {
      this.lock();
    } else {
      this.unlock();
    }
  }

  private unlock() {
    this.view.addInteraction(this.mouseWheelZoomInteraction);
    this.view.addInteraction(this.doubleClickZoomInteraction);
  }

  private lock() {
    this.view.removeInteraction(this.mouseWheelZoomInteraction);
    this.view.removeInteraction(this.doubleClickZoomInteraction);
    this.resolution = this.view.getView().getResolution();
  }

  selectTextEnabled(): boolean {
    return this.bookService.viewer === 'image' && this.bookService.isActionEnabled('selection');
  }

  showSelectText(): boolean {
    return !this.bookService.showGeoreference && this.bookService.viewer === 'image' && this.bookService.isActionAvailable('selection');
  }

  imageCropEnabled(): boolean {
    return this.bookService.viewer === 'image' && this.bookService.iiifEnabled && this.bookService.isActionEnabled('crop');
  }

  showImageCrop(): boolean {
    return this.bookService.viewer === 'image' && this.bookService.iiifEnabled && this.bookService.isActionAvailable('crop') && this.bookService.getPage() && this.bookService.getPage().imageType == PageImageType.TILES;
  }

  private positionMenu(pixel) {
    if (this.selectionHA == 'right') {
      this.selectionMenu.style.left = (pixel[0] - 40) + 'px';
    } else {
      this.selectionMenu.style.left = (pixel[0] + 10) + 'px';
    }
    if (this.selectionVA == 'top') {
      this.selectionMenu.style.top = (pixel[1] + 5) + 'px';
    } else {
      this.selectionMenu.style.top = (pixel[1] - this.selectionMenu.clientHeight) + 'px';
    }
  }

  private updateMenuPosition() {
    if (!this.selectionPosition) {
      this.selectionMenu.style.left = '-1000px';
      return;
    }
    // this.hideOnInactivity = true;
    const pixel = this.view.getPixelFromCoordinate(this.selectionPosition);
    if (pixel) {
      this.positionMenu(pixel);
    }
  }

  createMask(extent) {
    const innerRing = [
      [extent[0], extent[1]],
      [extent[0], extent[3]],
      [extent[2], extent[3]],
      [extent[2], extent[1]],
      [extent[0], extent[1]]
    ];
    const mapExtent = this.extent;
    const outerRing = [
      [mapExtent[0], mapExtent[1]],
      [mapExtent[0], mapExtent[3]],
      [mapExtent[2], mapExtent[3]],
      [mapExtent[2], mapExtent[1]],
      [mapExtent[0], mapExtent[1]]
    ];
    const maskFeature = new ol.Feature({
      geometry: new ol.geom.Polygon([outerRing, innerRing])
    });
    this.maskLayer.getSource().clear();
    this.maskLayer.getSource().addFeature(maskFeature);
  }

  onSelectionEnd(extent, width: number, height: number, right: boolean) {
    const viewExtent = this.view.getView().calculateExtent(this.view.getSize());
    this.selectionWidth = width;
    this.selectionHeight = height;
    this.selectionRight = right;
    this.selectionExtent = extent;
    let vPosition = extent[3];
    let hPosition = extent[2];
    const topRightSelection = this.view.getPixelFromCoordinate([extent[2], extent[3]]);
    const topRightView = this.view.getPixelFromCoordinate([viewExtent[2], viewExtent[3]]);
    const bottomLeftSelection = this.view.getPixelFromCoordinate([extent[0], extent[1]]);
    const bottomLeftView = this.view.getPixelFromCoordinate([viewExtent[0], viewExtent[1]]);
    const menuHeight = this.selectionMenu.clientHeight;
    this.selectionVA = 'top';
    if (bottomLeftView[1] - topRightSelection[1] < menuHeight + 5) {
      this.selectionVA = 'bottom';
      vPosition = extent[1];
    }
    this.selectionHA = 'left';
    if (topRightView[0] - topRightSelection[0] < 50) {
      if (bottomLeftSelection[0] - bottomLeftView[0] > 50) {
        hPosition = extent[0];
        this.selectionHA = 'right';
      } else {
        this.selectionHA = 'right';
      }
    }
    this.selectionPosition = [hPosition, vPosition];
    this.createMask(extent);
    this.updateMenuPosition();
    this.view.removeInteraction(this.selectionInteraction);
    this.view.getViewport().style.cursor = '';
  }

  onShareSelection() {
    this.bookService.shareSelection(this.selectionExtent, this.selectionRight);
}

  onShowImageCrop() {
      this.bookService.showImageCrop(this.selectionExtent, this.selectionRight);
  }

  onShowTextSelection() {
      this.bookService.showTextSelection(this.selectionExtent, this.selectionWidth, this.selectionHeight, this.selectionRight);
  }

  aiActionsEnabled(): boolean {
    return this.settings.ai && this.authService.isLoggedIn();
  }

  showPageActions(): boolean {
    return !this.selectionModeOn && this.bookService.viewer === 'image' && this.bookService.getPage() && !this.bookService.showGeoreference;
  }

  onReadSelection() {
    this.bookService.readSelection(this.selectionExtent, this.selectionWidth, this.selectionHeight, this.selectionRight);
  }

  onTranslateSelection() {
    this.bookService.translate(this.selectionExtent, this.selectionWidth, this.selectionHeight, this.selectionRight);
  }

  onSummarizeSelection() {
    this.bookService.summarize(this.selectionExtent, this.selectionWidth, this.selectionHeight, this.selectionRight);
  }

  onPageOcr() {
    this.bookService.showOcr();
  }

  onTranslatePage() {
    this.bookService.translate();
  }

  onSummarizePage() {
    this.bookService.summarize();
  }
  
  onStartReadingPage() {
    this.bookService.toggleReading();
  }

  onStopReadingPage() {
    this.bookService.toggleReading();
  }

  cancelSelection() {
    this.maskLayer.getSource().clear();
    this.selectionPosition = null;
    this.selectionExtent = null;
    this.selectionWidth = null;
    this.selectionHeight = null;
    this.selectionRight = null;
    this.selectionModeOn = false;
    this.updateMenuPosition();
  }

  enterSelectionMode() {
    if (this.imageWidth1 > 0) {
      this.bookService.toggleDoublePage();
      return;
    }
    this.hideOnInactivity = true;
    this.selectionModeOn = true;
    this.view.addInteraction(this.selectionInteraction);
    this.view.getViewport().style.cursor = 'crosshair';
  }

  onMouseMove() {
    if (this.selectionModeOn) {
      return;
    }
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
      case ViewerActions.updateSite:
        this.updateSize();
        break;
      case ViewerActions.fitToScreen:
        this.fitToScreen();
        break;
      case ViewerActions.toggleLock:
        this.toggleLock();
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

  private updateSize() {
    if (this.view) {
      this.view.updateSize();
    }
  }

  private fitToScreen() {
    this.view.updateSize();
    this.view.getView().setRotation(0);
    this.view.getView().fit(this.extent);
  }

  private updateTtsBlock(block: any) {
    this.view.removeLayer(this.vectorLayer);
    this.vectorLayer.getSource().clear();
    if (!block) {
      return;
    }
    const box: any[] = [];
    const wc = block.width > 0 ? this.imageWidth / block.width : 1;
    const hc = block.height > 0 ? this.imageHeight / block.height : 1;
    console.log('wc', wc);
    console.log('hc', hc);
    console.log('block.width', block.aw);
    console.log('this.imageWidth', this.imageWidth);

    box.push([block.hMin * wc, -block.vMin * hc]);
    box.push([block.hMax * wc, -block.vMin * hc]);
    box.push([block.hMax * wc, -block.vMax * hc]);
    box.push([block.hMin * wc, -block.vMax * hc]);
    box.push([block.hMin * wc, -block.vMin * hc]);
    const polygon = new ol.geom.Polygon([box]);
    const feature = new ol.Feature(polygon);
    this.vectorLayer.getSource().addFeature(feature);
    this.view.addLayer(this.vectorLayer);
  }

  updateBoxes() {
    this.vectorLayer.getSource().clear();
    if (!this.data.query) {
      return;
    }
    this.api.getAlto(this.data.uuid1).subscribe(response => {
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

  buildWatermarkLayer(config: any, userId: string) {
    let style: any = null;
    if (config.type == "image") {
      style = () => {
        var zoom = this.view.getView().getResolution();
        const size = -this.extent[1];
        const m = 2000.0/size;
        return [
          new ol.style.Style({
            image: new ol.style.Icon({
              src: config.logo,
              scale: config.scale / m / zoom,
              opacity: config.opacity,
              crossOrigin: 'anonymous'
            })
          })
        ];
      };
    } else {
      style = () => {
        const text = config.staticText || userId || config.defaultText || '';
        const size = -this.extent[1];
        const m = 2000.0/size;
        var zoom = this.view.getView().getResolution();
        const font = `${config.fontSize}px roboto,sans-serif`;
        const scale = 2.0 / m / zoom;
        const color = config.color;
        return [
          new ol.style.Style({
            text: new ol.style.Text({
              font: font,
              fill: new ol.style.Fill({ color: color }),
              text: text,
              scale: scale,
              rotation: -Math.PI/4,
              textAlign: 'center'
            })
          })
        ];
      };

    }
    this.watermark = new ol.layer.Vector({
      name: 'watermark',
      source: new ol.source.Vector(),
      updateWhileInteracting: true,
      updateWhileAnimating: true,
      style: style
    })
    this.watermark.setZIndex(100);
    this.view.addLayer(this.watermark);
  }

  addWaterMark() {
    if (this.watermark) {
      this.watermark.getSource().clear();
    }



    if (!this.bookService.licence || !this.licences.available(this.bookService.licence)) {
      return;
    }
    const config = this.licences.watermark(this.bookService.licence);
    if (!config) {
      return;
    }
    if (!this.watermark) {
      const userId = this.authService.getUserId() || this.authService.getUserName();
      this.buildWatermarkLayer(config, userId);
    }



    // const config = this.settings.licences.dnnto.watermark;
    // if (!this.watermark) {
    //   const userId = "jan.rychtar@trinera.cz";
    //   this.buildWatermarkLayer(config, userId);
    // }
    let cw = config.colCount;
    const ch = config.rowCount;
    const sw = this.extent[0];
    const width = this.extent[2] - this.extent[0];
    if (this.extent[0] < 0) {
      cw = cw * 2;
    }
    const height = -this.extent[1];
    const p = config.probability;
    for (let i = 0; i < cw; i ++) {
     for (let j = 0; j < ch; j ++) {
       if (Math.floor((Math.random() * 100)) < p) {
        const x = sw + (i/(cw*1.0))*width + width/cw/2;
        const y = (j/(ch*1.0)) * height + height/ch/2;// + height/30.0*i; + 70;
        var point = new ol.Feature(new ol.geom.Point([x, -y]));
        this.watermark.getSource().addFeature(point);
      }
     }
    }
  }

  updateJpegImage(uuid1: string, uuid2: string) {
    this.onImageLoading();
    this.loadJpegImage(uuid1, uuid2, true, false)
  }
  
  loadJpegImage(uuid1: string, uuid2: string, left: boolean, thumb: boolean) {
    const uuid = left ? uuid1 : uuid2;
    const url = this.api.getFullJpegUrl(uuid);
    const image = new Image();
    const token = this.settings.getToken();
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "arraybuffer";
    if (token) {
      xhr.setRequestHeader('Authorization', 'Bearer ' + token);
    }
    const context = this;
    xhr.onload = function () {
      if (xhr.status == 403) {
        context.onImageFailure();
        context.bookService.onInaccessibleImage();
      } else if (xhr.status != 200) {
        context.onImageFailure();
      } else {
        var arrayBufferView = new Uint8Array(this.response);
        var blob = new Blob([arrayBufferView], { type: 'image/png' });
        var urlCreator = window.URL || window['webkitURL'];
        var imageUrl = urlCreator.createObjectURL(blob);
        image.src = imageUrl;
      }
    };
    xhr.send();
    image.onload = (() => {
        if (left && uuid2) {
          this.imageWidth = image.width;
          this.imageHeight = image.height;
          this.loadJpegImage(uuid1, uuid2, false, thumb);
        } else {
          if (!left) {
            this.setDimensions(this.imageWidth, this.imageHeight, image.width, image.height);
            const url1 = this.api.getFullJpegUrl(uuid1);
            const thumb1 = this.api.getThumbStreamUrl(uuid1);
            this.addStaticImage(this.imageWidth, this.imageHeight, thumb ? thumb1 : url1, 1);
            const url2 = url;
            const thumb2 = this.api.getThumbStreamUrl(uuid2);
            this.addStaticImage(image.width, image.height, thumb ? thumb2 : url2,  2);
          } else {
            this.setDimensions(image.width, image.height, null, null);
            const thumb1 = this.api.getThumbStreamUrl(uuid1);
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
  }


  updateZoomifyImage(uuid1: string, uuid2: string) {
    const url1 = this.api.getZoomifyBaseUrl(uuid1);
    const url2 = !!uuid2 ? this.api.getZoomifyBaseUrl(uuid2) : null;

    this.onImageLoading();
    const rq = [];
    let w1, w2, h1, h2;
    rq.push(this.http.get(this.zoomify.properties(url1), { observe: 'response', responseType: 'text' }));
    if (url2) {
      rq.push(this.http.get(this.zoomify.properties(url2), { observe: 'response', responseType: 'text' }));
    }
    forkJoin(rq).subscribe((results) => {
      const p1 = this.zoomify.parseProperties(results[0]['body']);
      w1 = p1.width;
      h1 = p1.height;
      if (url2 && results.length > 1) {
        const p2 = this.zoomify.parseProperties(results[1]['body']);
        w2 = p2.width;
        h2 = p2.height;
      }
      this.setDimensions(w1, h1, w2, h2);
      if (url2 && results.length > 1) {
        this.addZoomifyImage(w1, h1, url1, this.api.getThumbStreamUrl(uuid1), 1);
        this.addZoomifyImage(w2, h2, url2, this.api.getThumbStreamUrl(uuid2), 2);
      } else {
        this.addZoomifyImage(w1, h1, url1, this.api.getThumbStreamUrl(uuid1), 0);
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


  updateIiifImage(uuid1: string, uuid2: string) {
    let url1 = this.api.getIiifBaseUrl(uuid1);
    let url2 = !!uuid2 ? this.api.getIiifBaseUrl(uuid2) : null;

    if (this.settings.replaceImageUrl) {
      url1 = url1.replace(this.settings.url, this.settings.replaceImageUrl);
      if (url2) {
        url2 = url2.replace(this.settings.url, this.settings.replaceImageUrl);
      }
    }

    this.onImageLoading();
    const rq = [];
    let w1, w2, h1, h2;
    rq.push(this.http.get(this.iiif.imageManifest(url1)));
    if (url2) {
      rq.push(this.http.get(this.iiif.imageManifest(url2)));
    }
    forkJoin(rq).subscribe((results) => {
      w1 = results[0]['width'];
      h1 = results[0]['height'];
      if (url2 && results.length > 1) {
        w2 = results[1]['width'];
        h2 = results[1]['height'];
      }
      this.setDimensions(w1, h1, w2, h2);
      if (url2 && results.length > 1) {
        this.addIIIFImage(results[0], w1, h1, url1, this.api.getThumbStreamUrl(uuid1), 1);
        this.addIIIFImage(results[1], w2, h2, url2, this.api.getThumbStreamUrl(uuid2), 2);
      } else {
        this.addIIIFImage(results[0], w1, h1, url1, this.api.getThumbStreamUrl(uuid1), 0);
      }
      this.onImageSuccess();
    },
    (error)  => {
        this.onImageFailure();
        if (error && error.status === 403) {
          this.bookService.onInaccessibleImage();
        } else if (error && error.status === 404) {
          this.updateZoomifyImage(uuid1, uuid2);
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
    this.bookService.onImageSuccess();
    this.imageLoading = false;
    if (this.bookService.zoomLockEnabled && this.resolution) {
      this.view.getView().fit(this.extent);
      this.initialResolution = this.view.getView().getResolution();
      this.view.getView().setResolution(1);
      const size = this.view.getSize();
      let c = size[0]/2;
      let s = 0;
      if (this.extent[0] != 0) {
        s = -(this.extent[2] - this.extent[0])/2.0;
        c = s + size[0] / 2;
      }
      this.view.getView().setCenter([c,-size[1]/2]);
      this.view.getView().adjustResolution(this.resolution, [s, 0]);
    } else {
      this.view.getView().fit(this.extent);
      this.initialResolution = this.view.getView().getResolution();
    }
    this.view.addLayer(this.maskLayer);
    this.updateBoxes();
    this.addWaterMark();
    if (this.data.bb) {

      const bb = this.data.bb.split(',');
      const extent = [parseInt(bb[0]),  -1*(parseInt(bb[1]) + parseInt(bb[3])),  parseInt(bb[0])+parseInt(bb[2]) , -parseInt(bb[1])];
      setTimeout(() => {
        this.view.getView().fit(extent);      
        this.onBoxEnd(extent);
      }, 100);  
    }
  }

  onImageFailure() {
    this.bookService.onImageFailure();
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
    this.cancelSelection();
    if (!data) {
      return;
    }
    if (this.data && this.data.equals(data)) {
      return;
    }
    this.view.removeLayer(this.imageLayer);
    this.view.removeLayer(this.zoomifyLayer);
    this.view.removeLayer(this.imageLayer2);
    this.view.removeLayer(this.zoomifyLayer2);
    this.view.removeLayer(this.vectorLayer);
    this.view.removeLayer(this.maskLayer);
    this.data = data;
    switch (data.imageType) {
      case ViewerImageType.IIIF: 
        this.updateIiifImage(data.uuid1, data.uuid2);
        break;
      case ViewerImageType.ZOOMIFY: 
        this.updateZoomifyImage(data.uuid1, data.uuid2);
        break;
      case ViewerImageType.JPEG: 
        this.updateJpegImage(data.uuid1, data.uuid2);
        break;
    }
  }

  addIIIFImage(data, width, height, url, thumb, type) {
    let extent;
    if (type === 0) {
      extent = [0, -height, width, 0];
    } else if (type === 1) {
      extent = [-this.imageWidth / 2, -height, -this.imageWidth / 2 + width, 0];
    } else if (type === 2) {
      extent = [this.imageWidth / 2 - width, -height, this.imageWidth / 2, 0];
    }
    const options = new ol.format.IIIFInfo(data).getTileSourceOptions();
    if (options === undefined || options.version === undefined) {
      // Invalid IIIF
      return;
    }
    options.quality = 'default';
    options.zDirection = -1;
    options.extent = extent;
    options.url = url;
    // const thumbUrl = this.iiif.image(url, options.sizes[0][0], options.sizes[0][1]);
    const imageOptions = {
      url: thumb,
      imageExtent: extent
    };
    if (this.settings.crossOrigin) {
      options.crossOrigin = 'Anonymous';
      imageOptions['crossOrigin'] = 'Anonymous';
    }
    const iiifTileSource = new ol.source.IIIF(options);
    const imageSource = new ol.source.ImageStatic(imageOptions);
    const token = this.settings.getToken();
    if (token) {
      iiifTileSource.setTileLoadFunction(this.buildCustomLoader(token));
    }
    const zLayer = new ol.layer.Tile({
      source: iiifTileSource
    });
    const iLayer = new ol.layer.Image({
      source: imageSource
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

  addZoomifyImage(width, height, url, thumb, type) {
    let extent;
    if (type === 0) {
      extent = [0, -height, width, 0];
    } else if (type === 1) {
      extent = [-this.imageWidth / 2, -height, -this.imageWidth / 2 + width, 0];
    } else if (type === 2) {
      extent = [this.imageWidth / 2 - width, -height, this.imageWidth / 2, 0];
    }
    const zoomifyOptions = {
      tileSize: 256,
      tilePixelRatio: 1,
      url: url + '/',
      size: [width, height],
      tierSizeCalculation: 'truncated',
      extent: extent
    };
    const imageOptions = {
        url: thumb,
        imageExtent: extent
    };
    if (this.settings.crossOrigin) {
      zoomifyOptions['crossOrigin'] = 'Anonymous';
      imageOptions['crossOrigin'] = 'Anonymous';
    }
    const zoomifySource = new ol.source.Zoomify(zoomifyOptions);
    const imageSource = new ol.source.ImageStatic(imageOptions);

    const token = this.settings.getToken();
    if (token) {
      zoomifySource.setTileLoadFunction(this.buildCustomLoader(token));
    }
    const zLayer = new ol.layer.Tile({
      source: zoomifySource
    });    
    const iLayer = new ol.layer.Image({
      source: imageSource
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
    const token = this.settings.getToken();
    const source = new ol.source.ImageStatic({
      url: url,
      imageSize: [width, height],
      imageExtent: extent,
      imageLoadFunction : function(image, src) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", src);
        xhr.responseType = "arraybuffer";
        if (token) {
          xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        }
        xhr.onload = function () {
            var arrayBufferView = new Uint8Array(this.response);
            var blob = new Blob([arrayBufferView], { type: 'image/png' });
            var urlCreator = window.URL || window['webkitURL'];
            var imageUrl = urlCreator.createObjectURL(blob);
            image.getImage().src = imageUrl;
        };
        xhr.send();
      }
    });
    const iLayer = new ol.layer.Image({
      source: source
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
    // this.bookService.clear();
    if (this.viewerActionsSubscription) {
      this.viewerActionsSubscription.unsubscribe();
    }
    if (this.pageSubscription) {
      this.pageSubscription.unsubscribe();
    }
    if (this.ttsSubscription) {
      this.ttsSubscription.unsubscribe();
    }
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
    this.view.removeLayer(this.imageLayer);
    this.view.removeLayer(this.zoomifyLayer);
    this.view.removeLayer(this.imageLayer2);
    this.view.removeLayer(this.zoomifyLayer2);
    this.view.removeLayer(this.vectorLayer);
    this.view.removeLayer(this.maskLayer);
  }

  today() {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return day + '.' + month + '.' + year;
  }


  buildCustomLoader(token): any {
    return (tile, src) => {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", src);
      xhr.responseType = "arraybuffer";
      if (token) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      }
      xhr.onload = function () {
          var arrayBufferView = new Uint8Array(this.response);
          var blob = new Blob([arrayBufferView], { type: 'image/png' });
          var urlCreator = window.URL || window['webkitURL'];
          var imageUrl = urlCreator.createObjectURL(blob);
          tile.getImage().src = imageUrl;
      };
      xhr.send();
    }
  }

}

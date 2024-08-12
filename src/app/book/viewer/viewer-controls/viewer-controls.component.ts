import { BookService } from './../../../services/book.service';
import { ViewerControlsService } from '../../../services/viewer-controls.service';
import { Component, Input, OnInit} from '@angular/core';
import { AnalyticsService } from '../../../services/analytics.service';
import { PdfService } from '../../../services/pdf.service';
import { EpubService } from '../../../services/epub.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-viewer-controls',
  templateUrl: './viewer-controls.component.html',
  styleUrls: ['./viewer-controls.component.scss']
})
export class ViewerControlsComponent implements OnInit {

  @Input() context: string;

  constructor(
    public controlsService: ViewerControlsService, 
    public authService: AuthService,
    public analytics: AnalyticsService,
    public pdfService: PdfService,
    public epubService: EpubService,
    public bookService: BookService) {
  }

  ngOnInit() {
  }

  // enterSelectionMode() {
  //   this.analytics.sendEvent('viewer', 'controls', 'selection');
  //   this.controlsService.enterSelectionMode();
  // }





  private showFullscreen(): boolean {
    return this.controlsService.fullscreenAvailable && !this.controlsService.fullscreenEnabled() && !this.showUnlock()
  }

  showEnterFullscreen(): boolean {
    return this.showFullscreen() && !this.controlsService.fullscreenEnabled();
  }

  showExitFullscreen(): boolean {
    return this.showFullscreen() && this.controlsService.fullscreenEnabled();
  }

  enterFullscreen() {
    let div = 'app-viewer';
    if (this.bookService.showGeoreference ) {
      div = 'geo_ol';
    } else if (this.bookService.viewerMode === 'split') {
      div = 'app-main-viewer';
    }
    this.controlsService.enterFullscreen(div);
    this.analytics.sendEvent('viewer', 'controls', 'enter fullscreen')
  }

  exitFullscreen() {
    this.controlsService.exitFullscreen();
    this.analytics.sendEvent('viewer', 'controls', 'exit fullscreen');
  }





  showViewerModeToggle(): boolean {
    return this.bookService.textModeSupported() && !this.showUnlock() && !this.bookService.showGeoreference;
  }

  toggleViewerMode() {
    this.bookService.toggleViewerMode();
    this.controlsService.toggleViewerMode();
    this.analytics.sendEvent('viewer', 'controls', 'toggle_text_mode');
    setTimeout(() => {
      this.controlsService.fitToScreen();
    }, 100);
  }

  showDoublePageOff(): boolean {
    return this.context !== 'text' && this.bookService.doublePageSupported() && this.bookService.doublePageEnabled && !this.showUnlock() && !this.bookService.showGeoreference;
  }

  showDoublePageOn(): boolean {
    return this.context !== 'text' && this.bookService.doublePageSupported() && !this.bookService.doublePageEnabled&& !this.showUnlock() && !this.bookService.showGeoreference;
  }

  doublePageOn()  {
    this.bookService.toggleDoublePage();
    this.controlsService.doublePageOn();
    this.analytics.sendEvent('viewer', 'controls', 'double page on');
  }

  doublePageOff()  {
    this.bookService.toggleDoublePage();
    this.controlsService.doublePageOff();
    this.analytics.sendEvent('viewer', 'controls', 'double page off');
  }



  showPrevNextPage(): boolean {
    return true;
  }

  showLock(): boolean {
    return this.context !== 'text' && !this.bookService.showGeoreference && this.bookService.isImage() && !this.bookService.zoomLockEnabled;
  }

  showUnlock(): boolean {
    return this.context !== 'text' && !this.bookService.showGeoreference && this.bookService.isImage() && this.bookService.zoomLockEnabled;
  }
  
  hideWarpedLayer() {
    this.controlsService.hideWarpedLayer();
  }

  onChangeOpacity(e) {
    this.controlsService.setWarpedLayerOpacity();
  }



  showCropMap(): boolean {
    return this.bookService.viewer === 'image' && this.bookService.getPage() && this.bookService.showGeoreference;
  }




  showZoom(): boolean {
    return !this.showUnlock();
  }

  zoomIn() {
    if (this.context === 'text') {
      this.controlsService.textZoomIn();
      this.analytics.sendEvent('viewer', 'controls', 'zoom in text')
    } else {
      this.controlsService.zoomIn();
      this.analytics.sendEvent('viewer', 'controls', 'zoom in')
    }
  }

  zoomOut() {
    if (this.context === 'text') {
      this.controlsService.textZoomOut();
      this.analytics.sendEvent('viewer', 'controls', 'zoom out text')
    } else {
      this.controlsService.zoomOut();
      this.analytics.sendEvent('viewer', 'controls', 'zoom out')
    }
  }

  showFitToScreen(): boolean {
    return !this.bookService.isEpub() && !this.showUnlock() && this.context != 'text';
  }

  fitToScreen() {
    this.controlsService.fitToScreen();
    this.analytics.sendEvent('viewer', 'controls', 'fit to screen');
  }

  showRotation(): boolean {
    return !this.bookService.showGeoreference && !this.bookService.isEpub()&& !this.showUnlock() && !this.bookService.showGeoreference && this.context != 'text'
  }

  rotate() {
    this.controlsService.rotateRight();
    this.analytics.sendEvent('viewer', 'controls', 'rotate')
  }




  hasNext(): boolean {
    if (this.bookService.isEpub()) {
      return true;
    }
    else if (this.bookService.isPdf()) {
      return this.pdfService.hasNext();
    } else {
      return this.bookService.hasNext();
    }
  }

  hasPrevious(): boolean {
    if (this.bookService.isEpub()) {
      return true;
    }
    else if (this.bookService.isPdf()) {
      return this.pdfService.hasPrevious();
    } else {
      return this.bookService.hasPrevious();
    }
  }

  goToPrevious() {
    this.analytics.sendEvent('viewer', 'controls', 'previous page');
    if (this.bookService.isEpub()) {
      return this.epubService.goToPrevious();
    }
    else if (this.bookService.isPdf()) {
      return this.pdfService.goToPrevious();
    } else {
      return this.bookService.goToPrevious();
    }
  }

  goToNext() {
    this.analytics.sendEvent('viewer', 'controls', 'next page');
    if (this.bookService.isEpub()) {
      return this.epubService.goToNext();
    }
    else if (this.bookService.isPdf()) {
      return this.pdfService.goToNext();
    } else {
      return this.bookService.goToNext();
    }
  }

  showGeoMap() {
    this.bookService.showGeoreference = true;
  }

  hideGeoMap() {
    this.bookService.showGeoreference = false;
  }
  
}

import { BookService } from './../../../services/book.service';
import { ViewerControlsService } from '../../../services/viewer-controls.service';
import { Component, OnInit} from '@angular/core';
import { AnalyticsService } from '../../../services/analytics.service';
import { PdfService } from '../../../services/pdf.service';
import { EpubService } from '../../../services/epub.service';
import { PageImageType } from '../../../model/page.model';

@Component({
  selector: 'app-viewer-controls',
  templateUrl: './viewer-controls.component.html',
  styleUrls: ['./viewer-controls.component.scss']
})
export class ViewerControlsComponent implements OnInit {

  constructor(
    public controlsService: ViewerControlsService, 
    public analytics: AnalyticsService,
    public pdfService: PdfService,
    public epubService: EpubService,
    public bookService: BookService) {
  }

  ngOnInit() {
  }

  onCropImageClicked() {
    if (this.bookService.cropEnabled() || this.bookService.showGeoreference) {
      this.controlsService.cropImage();
      this.analytics.sendEvent('viewer', 'controls', 'crop image');
    }
  }

  showPrevNextPage(): boolean {
    return true;
  }

  showLock(): boolean {
    return !this.bookService.showGeoreference && this.bookService.isImage() && !this.bookService.zoomLockEnabled;
  }

  showUnlock(): boolean {
    return !this.bookService.showGeoreference && this.bookService.isImage() && this.bookService.zoomLockEnabled;
  }
  
  hideWarpedLayer() {
    this.controlsService.hideWarpedLayer();
  }

  onChangeOpacity(e) {
    this.controlsService.setWarpedLayerOpacity();
  }

  showDoublePageOff(): boolean {
    return !this.bookService.showGeoreference && this.bookService.doublePageSupported() && this.bookService.doublePageEnabled;
  }

  showDoublePageOn(): boolean {
    return !this.bookService.showGeoreference && this.bookService.doublePageSupported() && !this.bookService.doublePageEnabled;
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

  showZoom(): boolean {
    return true;// !this.bookService.isEpub();
  }

  showFitToScreen(): boolean {
    return !this.bookService.isEpub();
  }

  showRotation(): boolean {
    return !this.bookService.showGeoreference && !this.bookService.isEpub();
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

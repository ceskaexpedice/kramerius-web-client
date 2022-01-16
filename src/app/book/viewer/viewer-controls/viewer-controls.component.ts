import { BookService } from './../../../services/book.service';
import { ViewerControlsService } from '../../../services/viewer-controls.service';
import { Component, OnInit} from '@angular/core';
import { AnalyticsService } from '../../../services/analytics.service';
import { PdfService } from '../../../services/pdf.service';
import { EpubService } from '../../../services/epub.service';

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
    if (this.bookService.cropEnabled()) {
      this.controlsService.cropImage();
      this.analytics.sendEvent('viewer', 'controls', 'crop image');
    }
  }

  showDoublePageOff(): boolean {
    return this.bookService.doublePageSupported() && this.bookService.doublePageEnabled;
  }

  showDoublePageOn(): boolean {
    return this.bookService.doublePageSupported() && !this.bookService.doublePageEnabled;
  }

  showSelectText(): boolean {
    return this.bookService.viewer === 'image' && this.bookService.isActionAvailable('selection');
  }

  showImageCrop(): boolean {
    return this.bookService.viewer === 'image' && this.bookService.iiifEnabled && this.bookService.isActionAvailable('crop');
  }

  showZoom(): boolean {
    return true;// !this.bookService.isEpub();
  }

  showFitToScreen(): boolean {
    return !this.bookService.isEpub();
  }

  showRotation(): boolean {
    return !this.bookService.isEpub();
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
  
}

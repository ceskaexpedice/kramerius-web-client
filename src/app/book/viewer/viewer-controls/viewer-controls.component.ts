import { BookService } from './../../../services/book.service';
import { ViewerControlsService } from '../../../services/viewer-controls.service';
import { Component, OnInit} from '@angular/core';
import { AnalyticsService } from '../../../services/analytics.service';

@Component({
  selector: 'app-viewer-controls',
  templateUrl: './viewer-controls.component.html'})
export class ViewerControlsComponent implements OnInit {

  constructor(
    public controlsService: ViewerControlsService, 
    public analytics: AnalyticsService,
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
    return this.bookService.isActionAvailable('selection');
  }

  showImageCrop(): boolean {
    return this.bookService.iiifEnabled && this.bookService.isActionAvailable('crop');
  }
  
}

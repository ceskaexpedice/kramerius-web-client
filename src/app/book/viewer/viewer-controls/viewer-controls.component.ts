import { BookService } from './../../../services/book.service';
import { ViewerControlsService } from '../../../services/viewer-controls.service';
import { Component, OnInit, Input} from '@angular/core';
import { AnalyticsService } from '../../../services/analytics.service';
import { AppSettings } from '../../../services/app-settings';

@Component({
  selector: 'app-viewer-controls',
  templateUrl: './viewer-controls.component.html'})
export class ViewerControlsComponent implements OnInit {


  constructor(
    public controlsService: ViewerControlsService, 
    public analytics: AnalyticsService,
    public bookService: BookService,
    private settings: AppSettings) {
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
    return this.show(this.settings.showTextSelection);
  }

  showImageCrop(): boolean {
    return this.bookService.iiifEnabled && this.show(this.settings.showImageCrop);
  }

  private show(value: string): boolean {
    return value === 'allways' || (value === 'public' && !this.bookService.isPrivate);
  }
  
}

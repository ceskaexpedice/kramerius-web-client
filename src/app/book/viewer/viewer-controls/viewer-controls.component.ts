import { BookService } from './../../../services/book.service';
import { ViewerControlsService } from '../../../services/viewer-controls.service';
import { Component, OnInit} from '@angular/core';
import { AnalyticsService } from '../../../services/analytics.service';
import { AppSettings } from '../../../services/app-settings';
import { LicenceService } from '../../../services/licence.service';

@Component({
  selector: 'app-viewer-controls',
  templateUrl: './viewer-controls.component.html'})
export class ViewerControlsComponent implements OnInit {


  constructor(
    public controlsService: ViewerControlsService, 
    public analytics: AnalyticsService,
    private licences: LicenceService,
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
    return this.show('selection');
  }

  showImageCrop(): boolean {
    return this.bookService.iiifEnabled && this.show('crop');
  }

  private show(action: string): boolean {
    if (this.bookService.licence) {
      const l = this.licences.action(this.bookService.licence, action);
      if (l == 1) {
        return true;
      } else if (l == 2) {
        return false;
      }
    }
    const value = this.settings.actions[action];
    return value === 'always' || (value === 'public' && !this.bookService.isPrivate);
  }
  
}

import { BookService } from './../../../services/book.service';
import { ViewerControlsService } from './../../../services/viewre-controls.service.';
import { Component, OnInit, Input} from '@angular/core';
import { AnalyticsService } from '../../../services/analytics.service';

@Component({
  selector: 'app-viewer-controls',
  templateUrl: './viewer-controls.component.html'})
export class ViewerControlsComponent implements OnInit {


  constructor(public controlsService: ViewerControlsService, public analytics: AnalyticsService,
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

}

import { BookService } from './../../services/book.service';
import { Component, OnInit, Input} from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';
import { AppSettings } from '../../services/app-settings';

@Component({
  selector: 'app-book-controls',
  templateUrl: './book-controls.component.html'})
export class BookControlsComponent implements OnInit {


  constructor(public bookService: BookService, public analytics: AnalyticsService, private settings: AppSettings) {
  }

  ngOnInit() {
  }

  isAvailable(): boolean {
    return this.settings.showDownload === 'allways' || (this.settings.showDownload === 'public' && !this.bookService.isPrivate);
  }

}


import { BookService } from './../../services/book.service';
import { Component, OnInit} from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-book-controls',
  templateUrl: './book-controls.component.html'})
export class BookControlsComponent implements OnInit {


  constructor(public bookService: BookService,
              public analytics: AnalyticsService) {
  }

  ngOnInit() {
  }

  showPdfGeneration(): boolean {
    return this.bookService.isActionAvailable('pdf');
  }

  showPrintPreparation(): boolean {
    return this.bookService.isActionAvailable('print');
  }

  showPageJpeg(): boolean {
    return this.bookService.isActionAvailable('jpeg');
  }

  showPageOcr(): boolean {
    return this.bookService.isActionAvailable('text');
  }

}


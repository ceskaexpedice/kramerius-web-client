import { BookService } from './../../services/book.service';
import { Component, OnInit} from '@angular/core';
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

  showPdfGeneration(): boolean {
    return this.show(this.settings.showPdfGeneration);
  }

  showPrintPreparation(): boolean {
    return this.show(this.settings.showPrintPreparation);
  }

  showPageJpeg(): boolean {
    return this.show(this.settings.showPageJpeg);
  }

  showPageOcr(): boolean {
    return this.show(this.settings.showPageOcr);
  }

  private show(value: string): boolean {
    return ((value === 'always' && !this.bookService.isPageInaccessible()) || (value === 'public' && !this.bookService.isPrivate));
  }

}

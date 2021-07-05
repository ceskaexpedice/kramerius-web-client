import { BookService } from './../../services/book.service';
import { Component, OnInit} from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';
import { AppSettings } from '../../services/app-settings';
import { LicenceService } from '../../services/licence.service';

@Component({
  selector: 'app-book-controls',
  templateUrl: './book-controls.component.html'})
export class BookControlsComponent implements OnInit {


  constructor(public bookService: BookService,
              public analytics: AnalyticsService, 
              private licences: LicenceService,
              private settings: AppSettings) {
  }

  ngOnInit() {
  }

  showPdfGeneration(): boolean {
    return this.show('pdf');
  }

  showPrintPreparation(): boolean {
    return this.show('print');
  }

  showPageJpeg(): boolean {
    return this.show('jpeg');
  }

  showPageOcr(): boolean {
    return this.show('text');
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


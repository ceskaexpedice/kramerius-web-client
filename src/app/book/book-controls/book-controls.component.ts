import { BookService } from './../../services/book.service';
import { Component, OnInit} from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';
import { EpubService } from '../../services/epub.service';

@Component({
  selector: 'app-book-controls',
  templateUrl: './book-controls.component.html',
  styleUrls: ['./book-controls.component.scss']
})
export class BookControlsComponent implements OnInit {


  constructor(public bookService: BookService,
              public epubService: EpubService,
              public analytics: AnalyticsService) {
  }

  ngOnInit() {
  }

  openFile(event) {
    this.epubService.openFile(event.target.files[0]);
  }

  print() {
    if (!this.bookService.isActionEnabled('print')) {
      return;
    }
    this.bookService.prepareToPrint();
    this.analytics.sendEvent('viewer', 'action', 'print');
  }

  pdf() {
    if (!this.bookService.isActionEnabled('pdf')) {
      return;
    }
    this.bookService.generatePdf();
    this.analytics.sendEvent('viewer', 'action', 'pdf');
  }

  jpeg() {
    if (!this.bookService.isActionEnabled('jpeg')) {
      return;
    }
    this.bookService.showJpeg();
    this.analytics.sendEvent('viewer', 'action', 'jpeg');
  }

  ocr() {
    if (!this.bookService.isActionEnabled('text')) {
      return;
    }
    this.bookService.showOcr();
    this.analytics.sendEvent('viewer', 'action', 'ocr');
  }

  uploadEpub() {
    if (this.bookService.isEpub()) {
      document.getElementById('app-file-input').click();
      return;
    }
  }

  downloadPdf() {
    if (!this.bookService.isActionEnabled('pdf')) {
      return;
    }
    this.bookService.downloadPdf();
    this.analytics.sendEvent('viewer', 'action', 'download');
  }



}


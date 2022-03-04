import { BookService } from './../../services/book.service';
import { Component, OnInit} from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';
import { EpubService } from '../../services/epub.service';

declare var $: any;

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

  showEpubUpload(): boolean {
    return this.bookService.isEpub();
  }

  showPdfDownload(): boolean {
    return this.bookService.isPdf() && this.bookService.isActionAvailable('pdf');
  }

  showPdfGeneration(): boolean {
    return this.bookService.isImage() && this.bookService.isActionAvailable('pdf');
  }

  showPrintPreparation(): boolean {
    return this.bookService.isImage() && this.bookService.isActionAvailable('print');
  }

  showPageJpeg(): boolean {
    return this.bookService.isImage() && this.bookService.isActionAvailable('jpeg');
  }

  showPageOcr(): boolean {
    return this.bookService.isImage() && this.bookService.isActionAvailable('text');
  }

  openFile(event) {
    this.epubService.openFile(event.target.files[0]);
  }

  print() {
    this.bookService.prepareToPrint();
    this.analytics.sendEvent('viewer', 'action', 'print');
  }

  pdf() {
    this.bookService.generatePdf();
    this.analytics.sendEvent('viewer', 'action', 'pdf');
  }

  jpeg() {
    this.bookService.showJpeg();
    this.analytics.sendEvent('viewer', 'action', 'jpeg');
  }

  ocr() {
    this.bookService.showOcr();
    this.analytics.sendEvent('viewer', 'action', 'ocr');
  }

  uploadEpub() {
    if (this.bookService.isEpub()) {
      $('#app-file-input').trigger('click');
      return;
    }
  }

  downloadPdf() {
    this.bookService.downloadPdf();
    this.analytics.sendEvent('viewer', 'action', 'download');
  }



}


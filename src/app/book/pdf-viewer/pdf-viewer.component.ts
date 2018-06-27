import { BookService, BookState, BookPageState } from './../../services/book.service';
import { Component, OnInit } from '@angular/core';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html'
})
export class PdfViewerComponent implements  OnInit {


  constructor(public bookService: BookService) {
  }

  ngOnInit() {
  }

  onError(error: any) {
    this.bookService.bookState = BookState.Failure;
    if (error && error['status'] === 403) {
      this.bookService.pageState = BookPageState.Inaccessible;
    } else {
      this.bookService.pageState = BookPageState.Failure;
    }
  }

  onSuccess(pdf: PDFDocumentProxy) {
    this.bookService.bookState = BookState.Success;
  }

}

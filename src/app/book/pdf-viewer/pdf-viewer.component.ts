import { ViewerControlsService, ViewerActions } from './../../services/viewre-controls.service.';
import { Subscription } from 'rxjs/Subscription';
import { BookService, BookState } from './../../services/book.service';
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
  }

  onSuccess(pdf: PDFDocumentProxy) {
    this.bookService.bookState = BookState.Success;
  }

}

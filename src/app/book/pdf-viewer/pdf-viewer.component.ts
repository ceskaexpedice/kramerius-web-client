import { BookService } from './../../services/book.service';
import { Component, OnInit } from '@angular/core';
import { ViewerControlsService } from '../../services/viewre-controls.service.';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html'
})
export class PdfViewerComponent implements  OnInit {


  constructor(public bookService: BookService, public controlsService: ViewerControlsService) {
  }

  ngOnInit() {
  }

}

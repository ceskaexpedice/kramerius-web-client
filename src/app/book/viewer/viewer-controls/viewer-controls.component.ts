import { BookService } from './../../../services/book.service';
import { ViewerControlsService } from './../../../services/viewre-controls.service.';
import { Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'app-viewer-controls',
  templateUrl: './viewer-controls.component.html'})
export class ViewerControlsComponent implements OnInit {


  constructor(public controlsService: ViewerControlsService, public bookService: BookService) {
  }

  ngOnInit() {
  }

}

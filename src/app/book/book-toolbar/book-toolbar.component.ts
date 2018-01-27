import { BookService } from './../../services/book.service';
import { Component, OnInit } from '@angular/core';
import { AppState } from './../../app.state';

@Component({
  selector: 'app-book-toolbar',
  templateUrl: './book-toolbar.component.html'
})
export class BookToolbarComponent implements OnInit {

  constructor(public bookService: BookService) { }

  ngOnInit() {
  }

}

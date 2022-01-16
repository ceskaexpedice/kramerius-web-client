import { BookService } from './../../services/book.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-book-toolbar',
  templateUrl: './book-toolbar.component.html',
  styleUrls: ['./book-toolbar.component.scss']
})
export class BookToolbarComponent implements OnInit {

  constructor(public bookService: BookService) { }

  ngOnInit() {
  }

}

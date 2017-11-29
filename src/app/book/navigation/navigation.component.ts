import { Page } from './../../model/page.model';
import { BookService } from './../../services/book.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  container;

  constructor(public bookService: BookService) {

  }

  ngOnInit() {
    this.container = document.getElementById('app-navigation-container');
  }

  public onPageSelected(page: Page) {
    this.bookService.goToPage(page);
  }

}

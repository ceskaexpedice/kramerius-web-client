import { Subscription } from 'rxjs/Subscription';
import { BookService } from './../../services/book.service';
import { Component, OnInit, Input} from '@angular/core';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: 'app-book-search',
  templateUrl: './book-search.component.html'})
export class BookSearchComponent implements OnInit, OnDestroy {

  fulltextQuery: string;
  pageSubscription: Subscription;

  constructor(public bookService: BookService) {
  }

  ngOnInit() {
    this.pageSubscription = this.bookService.watchPage().subscribe(
      pages => {
        console.log('page changed - fullt');
        this.fulltextQuery = this.bookService.getFulltextQuery();
      }
    );
  }

  onChange() {
    this.bookService.fulltextChanged(this.fulltextQuery);
  }

  ngOnDestroy(): void {
    this.pageSubscription.unsubscribe();
  }




}

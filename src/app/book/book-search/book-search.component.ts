import { Subscription } from 'rxjs/Subscription';
import { BookService } from './../../services/book.service';
import { Component, OnInit, Input} from '@angular/core';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: 'app-book-search',
  templateUrl: './book-search.component.html'})
export class BookSearchComponent implements OnInit, OnDestroy {

  fulltextQuery: string;
  // allPages: boolean;
  pageSubscription: Subscription;

  constructor(public bookService: BookService) {
  }

  ngOnInit() {
    this.pageSubscription = this.bookService.watchPage().subscribe(
      pages => {
        this.fulltextQuery = this.bookService.getFulltextQuery();
      }
    );
  }


  onKeyUp(event) {
    if (event.keyCode === 13) {
      this.changeQuery();
    }
    event.stopPropagation();
  }

  changeQuery() {
    this.bookService.fulltextChanged(this.fulltextQuery);
  }

  ngOnDestroy(): void {
    this.pageSubscription.unsubscribe();
  }

  cleanQuery() {
    this.fulltextQuery = '';
    this.bookService.fulltextChanged(this.fulltextQuery);
  }

  checkboxChanged() {
   this.bookService.fulltextAllPagesChanged();
  }


}

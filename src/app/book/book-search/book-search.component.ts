import { Subscription } from 'rxjs';
import { BookService } from './../../services/book.service';
import { Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';
import { CompleterCmp } from 'ng2-completer';
import { DocumentSearchService } from '../../services/document-search.service';

@Component({
  selector: 'app-book-search',
  templateUrl: './book-search.component.html',
  styleUrls: ['./book-search.component.scss']
})
export class BookSearchComponent implements OnInit, OnDestroy {

  fulltextQuery: string;
  // allPages: boolean;
  pageSubscription: Subscription;

  @ViewChild('completer', { static: true }) completer: CompleterCmp;


  constructor(public bookService: BookService,
              public service: DocumentSearchService,
              public analytics: AnalyticsService) {
  }

  ngOnInit() {
    this.pageSubscription = this.bookService.watchPage().subscribe(
      pages => {
        this.fulltextQuery = this.bookService.getFulltextQuery();
      }
    );
    this.completer.fillHighlighted = false;
  }

  onSelected(event) {
    if (event) {
      const title = event['title'];
      this.fulltextQuery = title;
      this.analytics.sendEvent('search phrase', 'viewer-by-return', this.fulltextQuery);
      this.changeQuery();
    }
  }

  onKeyUp(event) {
    if (event.keyCode === 13) {
      this.analytics.sendEvent('search phrase', 'viewer-by-return', this.fulltextQuery);
      this.changeQuery();
    }
    event.stopPropagation();
  }

  onMagnifyIconClick() {
    this.analytics.sendEvent('search phrase', 'viewer-by-icon', this.fulltextQuery);
    this.changeQuery();
  }

  changeQuery() {
    this.bookService.fulltextChanged(this.fulltextQuery);
  }

  ngOnDestroy(): void {
    this.pageSubscription.unsubscribe();
  }

  cleanQuery() {
    this.analytics.sendEvent('viewer', 'cancel-search');
    this.fulltextQuery = '';
    this.bookService.fulltextChanged(this.fulltextQuery);
  }

  checkboxChanged() {
   this.bookService.fulltextAllPagesChanged();
  }


}

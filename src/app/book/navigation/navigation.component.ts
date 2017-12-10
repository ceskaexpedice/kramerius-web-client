import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { Page } from './../../model/page.model';
import { BookService } from './../../services/book.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

declare var $: any;

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html'
})
export class NavigationComponent implements OnInit, OnDestroy {

  container;
  pageSubscription: Subscription;
  scrollOptions = {};
  pageIndex;

  constructor(public bookService: BookService) {

  }

  ngOnInit() {
    this.container = document.getElementById('app-navigation-container');
    this.pageSubscription = this.bookService.watchPage().subscribe(
      pages => {
        const page = pages[0];
        const el = document.getElementById('page-id-' + page.uuid);
        if (el) {
            el.scrollIntoView(this.scrollOptions);
            this.scrollOptions = {behavior: 'smooth'};
        }
        this.pageIndex = page.index + 1;
      }
    );
  }

  onPageIndexChanged() {
    if (isNaN(this.pageIndex)) {
      this.pageIndex = this.bookService.getPageIndex() + 1;
      return;
    }
    let index = parseInt(this.pageIndex, 10) - 1;
    if (index === this.bookService.getPageIndex()) {
      return;
    }
    if (index >= this.bookService.getPageCount()) {
      index = this.bookService.getPageCount() - 1;
    } else if (index < 0) {
      index = 0;
    }
    this.pageIndex = index + 1;
    this.bookService.goToPageOnIndex(index);
  }

  ngOnDestroy(): void {
    this.pageSubscription.unsubscribe();
  }

  public onPageSelected(page: Page) {
    this.bookService.goToPage(page);
  }

}

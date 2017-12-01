import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { Page } from './../../model/page.model';
import { BookService } from './../../services/book.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

declare var $: any;

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {

  container;
  pageSubscription: Subscription;
  scrollOptions = {};

  constructor(public bookService: BookService) {

  }

  ngOnInit() {
    this.container = document.getElementById('app-navigation-container');
    this.pageSubscription = this.bookService.watchPage().subscribe(
      page => {
        const el = document.getElementById('page-id-' + page.uuid);
        if (el) {
            el.scrollIntoView(this.scrollOptions);
        }
        this.scrollOptions = {behavior: 'smooth'};
      }
    );
  }

  ngOnDestroy(): void {
    this.pageSubscription.unsubscribe();
  }

  public onPageSelected(page: Page) {
    this.bookService.goToPage(page);
  }

}

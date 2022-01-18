import { Page } from './../../model/page.model';
import { BookService } from './../../services/book.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AnalyticsService } from '../../services/analytics.service';
import { EpubService } from '../../services/epub.service';
import { PdfService } from '../../services/pdf.service';

declare var $: any;

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {

  container;
  pageSubscription: Subscription;
  pageIndex;
  epubTocExpanded: boolean;

  constructor(public bookService: BookService, 
    public epubService: EpubService,
    public pdfService: PdfService,
    public analytics: AnalyticsService) {

  }

  ngOnInit() {
    this.epubTocExpanded = false;
    this.container = document.getElementById('app-navigation-container');
    this.goToPage(this.bookService.getPage());
    this.pageSubscription = this.bookService.watchPage().subscribe(
      pages => {
        const page = pages[0];
        this.goToPage(page, 100);
      }
    );
  }

  private goToPage(page: Page, wait = 0) {
    if (!page) {
      return;
    }
    setTimeout(() => {
      const el = document.getElementById('page-id-' + page.uuid);
      if (el) {
          el.scrollIntoView( {behavior: 'smooth'} );
      }
    }, wait);
    this.pageIndex = page.index + 1;
  }


  onKeyUp(event) {
    if (event.keyCode === 13) {
      if (this.bookService.isEpub()) {
        console.log('keyup', event)
        // this.epubService.goToPage()
      } else {
        this.onPageIndexChanged();
      }
    }
    event.stopPropagation();
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
    this.bookService.activeMobilePanel = 'viewer';
  }

  ngOnDestroy(): void {
    this.pageSubscription.unsubscribe();
  }

  public onPageSelected(page: Page) {
    this.bookService.goToPage(page);
    this.bookService.activeMobilePanel = 'viewer';
  }

}

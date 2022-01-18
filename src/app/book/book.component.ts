import { ViewerControlsService } from '../services/viewer-controls.service';
import { BookService } from './../services/book.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { combineLatest } from 'rxjs';
import { AnalyticsService } from '../services/analytics.service';
import { PdfService } from '../services/pdf.service';
import { EpubService } from '../services/epub.service';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.scss']

})
export class BookComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute,
              public bookService: BookService,
              private pdfService: PdfService,
              private epubService: EpubService,
              public analytics: AnalyticsService,
              public viewerControls: ViewerControlsService) {

  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event && (event.keyCode === 37 || event.keyCode === 38)) {
      this.analytics.sendEvent('viewer', 'keyboard', 'previous page');
      if (this.bookService.isEpub()) {
        this.epubService.goToPrevious();
      } else if (this.bookService.isPdf()) {
        this.pdfService.goToPrevious();
      } else {
        this.bookService.goToPrevious();
      }
    } else if (event && (event.keyCode === 39 || event.keyCode === 40)) {
      this.analytics.sendEvent('viewer', 'keyboard', 'next page');
      if (this.bookService.isEpub()) {
        this.epubService.goToNext();
      } else if (this.bookService.isPdf()) {
        this.pdfService.goToNext();
      } else {
        this.bookService.goToNext();
      }
    }
  }

  ngOnInit() {
    this.viewerControls.clear();
    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(
      results => {
        const p = results[0];
        const q = results[1];
        const uuid = p.get('uuid');
        if (uuid) {
          const page = q.get('page');
          const article = q.get('article');
          const chapter = q.get('chapter');
          const parent = q.get('parent');
          const fulltext = q.get('fulltext');
          this.bookService.init({
            uuid: uuid,
            pageUuid: page,
            articleUuid: article,
            internalPartUuid: chapter,
            parentUuid: parent,
            fulltext: fulltext
          });
        }
    });
  }

  ngOnDestroy(): void {
    this.bookService.clear();
  }

}

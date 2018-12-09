import { ViewerControlsService } from './../services/viewre-controls.service.';
import { BookService } from './../services/book.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { combineLatest } from 'rxjs/observable/combineLatest';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html'
})
export class BookComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute,
              public bookService: BookService,
              public viewerControls: ViewerControlsService) {

  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event && event.keyCode === 37) {
      this.bookService.goToPrevious();
    } else if (event && event.keyCode === 39) {
      this.bookService.goToNext();
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
          const fulltext = q.get('fulltext');
          this.bookService.init(uuid, page, article, fulltext);
        }
    });
  }

  ngOnDestroy(): void {
    this.bookService.clear();
  }

}

import { ViewerControlsService } from './../services/viewre-controls.service.';
import { Observable } from 'rxjs/Observable';
import { LocalStorageService } from './../services/local-storage.service';
import { DocumentItem } from './../model/document_item.model';
import { ModsParserService } from './../services/mods-parser.service';
import { Page } from './../model/page.model';
import { BookService } from './../services/book.service';
import { KrameriusApiService } from './../services/kramerius-api.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import 'rxjs/add/observable/forkJoin';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html'
})
export class BookComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute,
              public bookService: BookService,
              public viewerControls: ViewerControlsService) {

  }

  ngOnInit() {
    this.viewerControls.clear();
    this.route.paramMap.subscribe(params => {
      const uuid = params.get('uuid');
      if (uuid) {
        this.route.queryParamMap.subscribe(queryParams => {
          const page = queryParams.get('page');
          const fulltext = queryParams.get('fulltext');
          this.bookService.init(uuid, page, fulltext);
        });
      } else {
        // TODO: Show warning message
      }
    });
  }

  ngOnDestroy(): void {
    this.bookService.clear();
  }

}

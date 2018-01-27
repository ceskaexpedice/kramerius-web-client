import { ViewerControlsService } from './../services/viewre-controls.service.';
import { Observable } from 'rxjs/Observable';
import { LocalStorageService } from './../services/local-storage.service';
import { DocumentItem } from './../model/document_item.model';
import { Metadata } from './../model/metadata.model';
import { ModsParserService } from './../services/mods-parser.service';
import { Page } from './../model/page.model';
import { BookService } from './../services/book.service';
import { KrameriusApiService } from './../services/kramerius-api.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import 'rxjs/add/observable/forkJoin';
import { AppState } from './../app.state';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html'
})
export class BookComponent implements OnInit, OnDestroy {

  metadata: Metadata;

  constructor(private route: ActivatedRoute,
              public bookService: BookService,
              public viewerControls: ViewerControlsService,
              public localStorageService: LocalStorageService,
              private modsParserService: ModsParserService,
              private krameriusApiService: KrameriusApiService,
              public state: AppState) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const uuid = params.get('uuid');
      if (uuid) {
        this.route.queryParamMap.subscribe(queryParams => {
          const page = queryParams.get('page');
          const fulltext = queryParams.get('fulltext');
          this.loadDocument(uuid, page, fulltext);
        });
      } else {
        // TODO: Show warning message
      }
    });
  }

  ngOnDestroy(): void {
    this.bookService.clear();
  }


  private loadDocument(uuid: string, page: string, fulltext: string) {
    this.krameriusApiService.getChildren(uuid).subscribe(response => {
      if (response && response.length > 0) {
        this.bookService.init(uuid, response, page, fulltext);
      } else {
        // TODO: Empty document
      }
    });
    this.krameriusApiService.getItem(uuid).subscribe((item: DocumentItem) => {
      this.krameriusApiService.getMods(item.root_uuid).subscribe(response => {
        this.metadata = this.modsParserService.parse(response);
        this.metadata.doctype = (item.doctype && item.doctype.startsWith('periodical')) ? 'periodical' : item.doctype;
        this.localStorageService.addToVisited(item, this.metadata);
      });
    });
  }

}

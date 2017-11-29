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

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit, OnDestroy {

  metadata: Metadata;

  constructor(private route: ActivatedRoute,
              public bookSerrvice: BookService,
              private localStorageService: LocalStorageService,
              private modsParserService: ModsParserService,
              private krameriusApiService: KrameriusApiService) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const uuid = params.get('uuid');
      if (uuid) {
        this.route.queryParamMap.subscribe(queryParams => {
          const page = queryParams.get('page');
          this.loadDocument(uuid, page);
          // console.log('page', );
        });
      } else {
        // TODO: Show warning message
      }
    });

    // Observable.forkJoin(this.route.params, this.route.queryParams.).subscribe(bothParams => {
    //   const book = bothParams[0].get('uud');
    //   const page = bothParams[1].get('page');
    //   console.log('book', book);
    //   console.log('page', page);

  //  });

  }

  ngOnDestroy(): void {
    this.bookSerrvice.clear();
  }


  private loadDocument(uuid: string, page: string) {
    console.log('page', page);
    this.krameriusApiService.getChildren(uuid).subscribe(response => {
      if (response && response.length > 0) {
        this.bookSerrvice.init(uuid, response, page);
      } else {
        // TODO: Empty document
      }
    });
    this.krameriusApiService.getItem(uuid).subscribe((item: DocumentItem) => {
      this.localStorageService.addToVisited(item);
      this.krameriusApiService.getMods(item.root_uuid).subscribe(response => {
        this.metadata = this.modsParserService.parse(response);
        this.metadata.doctype = item.doctype;
      });
    });
  }

  // public onItemSelected(item) {
  //   const ctx = this;
  //   const url = this.krameriusApiService.getZoomifyRootUrl(item.pid);
  //   this.krameriusApiService.getZoomifyProperties(item.pid).subscribe(response => {
  //     if (!response) {
  //       return;
  //     }
  //     const a = response.toLowerCase().split('"');
  //     const width = parseInt(a[1], 10);
  //     const height = parseInt(a[3], 10);
  //     const page = new Page(width, height, url);
  //     this.bookSerrvice.leftPage = page;
  //   });
  // }

}

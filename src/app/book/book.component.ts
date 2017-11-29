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
        this.loadDocument(uuid);
      } else {
        // TODO: Show warning message
      }
    });
  }

  ngOnDestroy(): void {
    this.bookSerrvice.clear();
  }


  private loadDocument(uuid: string) {
    this.krameriusApiService.getChildren(uuid).subscribe(response => {
      if (response && response.length > 0) {
        this.bookSerrvice.init(response);
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

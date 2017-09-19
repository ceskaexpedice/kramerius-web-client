import { Metadata } from './../model/metadata.model';
import { ModsParserService } from './../services/mods-parser.service';
import { Page } from './../model/page.model';
import { BookService } from './../services/book.service';
import { KrameriusApiService } from './../services/kramerius-api.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-book',
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit {

  children = [];
  metadata: Metadata;


  constructor(private route: ActivatedRoute,
              public bookSerrvice: BookService,
              private modsParserService: ModsParserService,
              private krameriusApiService: KrameriusApiService) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const uuid = params.get('uuid');
      if (uuid) {
        this.bookSerrvice.leftPage = null;
        this.bookSerrvice.rightPage = null;
        this.loadDocument(uuid);
      } else {
        this.bookSerrvice.leftPage = new Page(2056, 2775, 'https://kramerius.mzk.cz/search/zoomify/uuid:5de8741e-3f83-49f8-b7a6-274e1f49603b/');
        this.bookSerrvice.rightPage = new Page(2149, 2774, 'https://kramerius.mzk.cz/search/zoomify/uuid:ce36d3a4-fd97-4439-9bff-8524a6010be7/');
      }
    });
  }


  private loadDocument(uuid: string) {
    const ctx = this;
    this.krameriusApiService.getChildren(uuid).subscribe(response => {
      if (response && response.length > 0) {
        ctx.onItemSelected(response[0]);
        // ctx.children = response;
        ctx.children = [];
        const limit = Math.min(response.length, 30);
        for (let i = 0; i < limit; i++) {
          ctx.children.push(response[i]);
        }
      }
    });
    this.krameriusApiService.getMods(uuid).subscribe(response => {
      ctx.metadata = ctx.modsParserService.parse(response);
    });
  }

  public onItemSelected(item) {
    console.log('onItemSelected', item);
    const ctx = this;
    const url = this.krameriusApiService.getZoomifyRootUrl(item.pid);
    this.krameriusApiService.getZoomifyProperties(item.pid).subscribe(response => {
      console.log(response);
      if (!response) {
        return;
      }
      const a = response.toLowerCase().split('"');
      const width = parseInt(a[1], 10);
      const height = parseInt(a[3], 10);
      const page = new Page(width, height, url);
      this.bookSerrvice.leftPage = page;
    });
  }

}

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
              private bookSerrvice: BookService,
              private modsParserService: ModsParserService,
              private krameriusApiService: KrameriusApiService) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const uuid = params.get('uuid');
      if (uuid) {
        this.loadDocument(uuid);
      }
    });
  }


  private loadDocument(uuid: string) {
    const ctx = this;
    this.krameriusApiService.getChildren(uuid).subscribe(response => {
      ctx.children = response;
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

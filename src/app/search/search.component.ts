import { PageTitleService } from './../services/page-title.service';
import { SearchService } from './../services/search.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private pageTitle: PageTitleService,
    public searchService: SearchService) {
  }

  ngOnInit() {
    this.pageTitle.setTitle('search', null);
    combineLatest([this.route.paramMap, this.route.queryParams]).subscribe(
      results => {
        const p = results[0];
        const context = {
          key: 'none',
          value: ''
        };
        if (p && p.has('collection_uuid')) {
          context.key =  'collection';
          context.value =  p.get('collection_uuid');
        }
        const q = results[1];
        this.searchService.init(context, q);
      });
    // this.route.queryParams.subscribe(params => {
    //   this.searchService.init(params);
    // });
  }


}

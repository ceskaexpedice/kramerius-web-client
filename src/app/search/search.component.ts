import { PageTitleService } from './../services/page-title.service';
import { SearchService } from './../services/search.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html'
})
export class SearchComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private pageTitle: PageTitleService,
    public searchService: SearchService) {
  }

  ngOnInit() {
    this.pageTitle.setTitle('search', null);
    this.route.queryParams.subscribe(params => {
      this.searchService.init(params);
    });
  }


}

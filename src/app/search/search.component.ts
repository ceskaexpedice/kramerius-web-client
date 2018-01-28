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
    public searchService: SearchService) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchService.init(params);
    });
  }


}

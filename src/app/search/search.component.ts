import { SearchService } from './../services/search.service';
import { AppState } from './../app.state';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    public searchService: SearchService,
    public state: AppState) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchService.init(params);
    });
  }


}

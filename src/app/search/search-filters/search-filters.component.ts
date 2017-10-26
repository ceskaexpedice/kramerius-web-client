import { SearchService } from './../../services/search.service';
import { SearchQuery } from './../search_query.model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-search-filters',
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.scss']
})
export class SearchFiltersComponent implements OnInit {

  constructor(public searchService: SearchService) {
  }

  ngOnInit() {
  }

}

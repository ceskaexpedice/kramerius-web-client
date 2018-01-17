import { SearchService } from './../../services/search.service';
import { SearchQuery } from './../search_query.model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-search-filters',
  templateUrl: './search-filters.component.html'
})
export class SearchFiltersComponent implements OnInit {
  @Input() collapsedFilter: boolean;

  constructor(public searchService: SearchService) {
  }

  ngOnInit() {
  }

}

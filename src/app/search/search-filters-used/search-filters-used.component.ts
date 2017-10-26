import { SearchService } from './../../services/search.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-search-filters-used',
  templateUrl: './search-filters-used.component.html',
  styleUrls: ['./search-filters-used.component.scss']
})
export class SearchFiltersUsedComponent implements OnInit {

  constructor(public searchService: SearchService) {
  }

  ngOnInit() {
  }

}

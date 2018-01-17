import { SearchService } from './../../services/search.service';
import { DocumentItem } from './../../model/document_item.model';
import { Component, OnInit, Input } from '@angular/core';
import { AppState } from './../../app.state';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html'
})
export class SearchResultsComponent implements OnInit {

  constructor(public searchService: SearchService, public state: AppState) {
  }

  ngOnInit() {
  }

  // hide filters - pedro
  hideFilters() {
    this.state.filtersToggle();
  }
}

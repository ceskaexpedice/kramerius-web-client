import { SearchService } from './../../services/search.service';
import { DocumentItem } from './../../model/document_item.model';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {

  constructor(public searchService: SearchService) {
  }

  ngOnInit() {
  }
}

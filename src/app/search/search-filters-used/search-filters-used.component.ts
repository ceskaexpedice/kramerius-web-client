import { SearchService } from './../../services/search.service';
import { Component, OnInit } from '@angular/core';
import { CollectionService } from '../../services/collection.service';
import { LicenceService } from '../../services/licence.service';

@Component({
  selector: 'app-search-filters-used',
  templateUrl: './search-filters-used.component.html',
  styleUrls: ['./search-filters-used.component.scss']
})
export class SearchFiltersUsedComponent implements OnInit {

  constructor(public searchService: SearchService,
              public licences: LicenceService,
              public collections: CollectionService) {
  }

  ngOnInit() {
  }

}

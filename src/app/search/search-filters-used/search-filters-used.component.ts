import { SearchService } from './../../services/search.service';
import { Component, OnInit, Input } from '@angular/core';
import { AppSettings } from '../../services/app-settings';
import { CollectionService } from '../../services/collection.service';
import { LicenceService } from '../../services/licence.service';

@Component({
  selector: 'app-search-filters-used',
  templateUrl: './search-filters-used.component.html'
})
export class SearchFiltersUsedComponent implements OnInit {

  constructor(public searchService: SearchService,
              public licences: LicenceService,
              public collections: CollectionService,
              public appSettings: AppSettings) {
  }

  ngOnInit() {
  }

}

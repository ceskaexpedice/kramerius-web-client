import { AppSettings } from './../../services/app-settings';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { SearchService } from './../../services/search.service';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-search-toolbar',
  templateUrl: './search-toolbar.component.html'
})
export class SearchToolbarComponent implements OnInit {

  constructor(public searchService: SearchService,
    public analytics: AnalyticsService,
    public appSettings: AppSettings) {
  }

  ngOnInit() {
  }

  toggleFilters() {
    if (this.searchService.activeMobilePanel === 'results') {
      this.searchService.activeMobilePanel = 'filters';
    } else {
      this.searchService.activeMobilePanel = 'results';
    }
  }
}

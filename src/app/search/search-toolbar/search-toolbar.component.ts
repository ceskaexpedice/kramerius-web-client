import { AppSettings } from './../../services/app-settings';
import { Component, OnInit } from '@angular/core';
import { SearchService } from './../../services/search.service';
import { AnalyticsService } from '../../services/analytics.service';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-search-toolbar',
  templateUrl: './search-toolbar.component.html'
})
export class SearchToolbarComponent implements OnInit {

  constructor(public searchService: SearchService,
    public analytics: AnalyticsService,
    public account: AccountService,
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

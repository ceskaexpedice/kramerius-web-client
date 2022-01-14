import { AppSettings } from './../../services/app-settings';
import { Component, OnInit } from '@angular/core';
import { SearchService } from './../../services/search.service';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-search-toolbar',
  templateUrl: './search-toolbar.component.html',
  styleUrls: ['./search-toolbar.component.scss']

})
export class SearchToolbarComponent implements OnInit {

  constructor(
    public search: SearchService,
    public analytics: AnalyticsService,
    public settings: AppSettings) {
  }

  ngOnInit() {
  }

  toggleFilters() {
    if (this.search.activeMobilePanel === 'results') {
      this.search.activeMobilePanel = 'filters';
    } else {
      this.search.activeMobilePanel = 'results';
    }
  }

}

import { AppSettings } from './../../services/app-settings';
import { Component, OnInit } from '@angular/core';
import { SearchService } from './../../services/search.service';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';
import { CsvService } from '../../services/csv.service';

@Component({
  selector: 'app-search-toolbar',
  templateUrl: './search-toolbar.component.html',
  styleUrls: ['./search-toolbar.component.scss']

})
export class SearchToolbarComponent implements OnInit {

  constructor(
    public auth: AuthService,
    public search: SearchService,
    public analytics: AnalyticsService,
    public settings: AppSettings,
    public csv: CsvService) {
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
  downloadCsv() {
    console.log(this.search.results)
    this.csv.downloadTableAsCSV(this.search.results)
  }

}

import { AppSettings } from './../../services/app-settings';
import { Component, OnInit, ViewChild } from '@angular/core';
import { SearchService } from './../../services/search.service';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';
import { CsvService } from '../../services/csv.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-search-toolbar',
  templateUrl: './search-toolbar.component.html',
  styleUrls: ['./search-toolbar.component.scss']

})
export class SearchToolbarComponent implements OnInit {

  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;
  devMode: boolean = false;

  constructor(
    public auth: AuthService,
    public search: SearchService,
    public analytics: AnalyticsService,
    public settings: AppSettings,
    private localStorageService: LocalStorageService,
    public csv: CsvService) {
  }

  ngOnInit() {
    this.devMode = this.localStorageService.getProperty(LocalStorageService.DEV_MODE) === '1';
  }

  getOrderingOptions(): string[] {
    let options = [];
    if (this.search.query.relevanceOrderingEnabled()) {
      options.push('relevance');
    }
    options = options.concat(['alphabetical', 'newest', 'latest', 'earliest']);
    return options;
  }

  changeOrdering(ordering: string) {
    this.menuTrigger.closeMenu();
    this.search.changeOrdering(ordering);
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
    this.csv.downloadTableAsCSV(this.search.results, 'kramerius_data')
  }

}

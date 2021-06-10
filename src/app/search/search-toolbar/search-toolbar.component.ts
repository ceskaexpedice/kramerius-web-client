import { AppSettings } from './../../services/app-settings';
import { Component, OnInit } from '@angular/core';
import { SearchService } from './../../services/search.service';
import { AnalyticsService } from '../../services/analytics.service';
import { AccountService } from '../../services/account.service';
import { MzModalService } from 'ngx-materialize';
import { DialogAdminComponent } from '../../dialog/dialog-admin/dialog-admin.component';

@Component({
  selector: 'app-search-toolbar',
  templateUrl: './search-toolbar.component.html'
})
export class SearchToolbarComponent implements OnInit {

  constructor(
    public search: SearchService,
    public analytics: AnalyticsService,
    public account: AccountService,
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

import { AppSettings } from '../../services/app-settings';
import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';
import { SearchService } from '../../services/search.service';
import { AppState } from '../../app.state';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss']
})
export class LogoComponent implements OnInit {

  constructor(public settings: AppSettings, public state: AppState, private search: SearchService, public analytics: AnalyticsService) {
  }

  ngOnInit() {
  }

  changeLibrary(kramerius) {
    this.search.changeLibrary(kramerius);
  }


}

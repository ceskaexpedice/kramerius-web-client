import { AppSettings } from './../services/app-settings';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AnalyticsService } from '../services/analytics.service';
import { SearchService } from '../services/search.service';
import { AppState } from '../app.state';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss']
})
export class LogoComponent implements OnInit {

  @ViewChild('dropdown') dropdown;

  constructor(public settings: AppSettings, public state: AppState, private search: SearchService, public analytics: AnalyticsService) {
  }

  ngOnInit() {
  }

  open() {
    this.dropdown.open();
  }

  changeLibrary(kramerius) {
    this.dropdown.close();
    this.search.changeLibrary(kramerius);
  }


}

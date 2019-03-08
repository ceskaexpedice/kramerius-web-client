import { AppSettings } from './../services/app-settings';
import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../services/analytics.service';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html'
})
export class LogoComponent implements OnInit {

  constructor(public appSettings: AppSettings, public analytics: AnalyticsService) {
  }

  ngOnInit() {
  }

}

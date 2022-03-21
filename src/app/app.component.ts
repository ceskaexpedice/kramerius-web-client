import { AppSettings } from './services/app-settings';
import { HistoryService } from './services/history.service';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AppState } from './app.state';
import { Location } from '@angular/common';

import { MatomoInjector } from 'ngx-matomo';
import { AnalyticsService } from './services/analytics.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {


  showCookiebar = false;

  constructor(
    private location: Location,
    private history: HistoryService,
    private router: Router,
    private settings: AppSettings,
    private analytics: AnalyticsService,
    public state: AppState,
    private matomoInjector: MatomoInjector) {
  }

  ngOnInit() {
    this.showCookiebar = !localStorage.getItem('cpref') && this.settings.cookiebar;
    if (this.settings.matomo && (!this.settings.cookiebar || localStorage.getItem('cpref') == 'all' || localStorage.getItem('cpref') == 'analytical')) {
      this.matomoInjector.init(this.settings.matomo, 5);
    }
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.analytics.sendPageView(event.urlAfterRedirects);
        this.history.push(this.location.path());
        this.state.pageUrl = event.url;
      }
    });
  }
}

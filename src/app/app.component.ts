import { AppSettings } from './services/app-settings';
import { HistoryService } from './services/history.service';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AppState } from './app.state';
import { Location } from '@angular/common';

import { MatomoInjector } from 'ngx-matomo';
import { AnalyticsService } from './services/analytics.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  constructor(
    private translate: TranslateService,
    private location: Location,
    private history: HistoryService,
    private router: Router,
    private settings: AppSettings,
    private analytics: AnalyticsService,
    public state: AppState,
    private matomoInjector: MatomoInjector) {
  }

  ngOnInit() {
    if (this.settings.matomo) {
      this.matomoInjector.init(this.settings.matomo, 5);
    }
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.analytics.sendPageView(event.urlAfterRedirects);
        this.history.push(this.location.path());
        this.state.pageUrl = event.url;
      }
    });
    // const lang = localStorage.getItem('lang');
    // if (lang) {
    //   this.translate.use(lang);
    // }
  }
}

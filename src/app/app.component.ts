import { AppSettings } from './services/app-settings';
import { HistoryService } from './services/history.service';
import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AppState } from './app.state';
import { DOCUMENT, Location } from '@angular/common';

import { MatomoInjector } from 'ngx-matomo';
import { AnalyticsService } from './services/analytics.service';
import { TranslateService } from '@ngx-translate/core';

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
    private translate: TranslateService,
    private settings: AppSettings,
    private analytics: AnalyticsService,
    public state: AppState,
    @Inject(DOCUMENT) private document: Document,
    private matomoInjector: MatomoInjector) {
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key == 'Enter') {
      event.target.dispatchEvent(new Event("click"));
    }
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
    this.document.documentElement.lang = this.translate.currentLang; 
  }
}

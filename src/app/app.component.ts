import { AppSettings } from './services/app-settings';
import { HistoryService } from './services/history.service';
import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AppState } from './app.state';
import { DOCUMENT, Location } from '@angular/common';

import { MatomoInjector } from 'ngx-matomo';
import { AnalyticsService } from './services/analytics.service';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

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
    private dialog: MatDialog,
    @Inject(DOCUMENT) private document: Document,
    private matomoInjector: MatomoInjector) {

    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + settings.ga4;
    script.async = true;
    document.head.appendChild(script);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', settings.ga4, {
      send_page_view: false
    });
    if (!analytics.ga4Allowed()) {
      window.gtag('consent', 'default', {
        'ad_storage': 'denied',
        'analytics_storage': 'denied'
      });
    } else {
      window.gtag('consent', 'default', {
        'ad_storage': 'granted',
        'analytics_storage': 'granted'
      });
    }
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
        // console.log('pageview', event.urlAfterRedirects);
        this.analytics.sendPageView(event.urlAfterRedirects);
        this.history.push(this.location.path());
        this.state.pageUrl = event.url;
        this.dialog.closeAll();
      }
    });
    this.document.documentElement.lang = this.translate.currentLang; 
  }
}

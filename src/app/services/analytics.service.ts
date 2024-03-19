import { Injectable } from '@angular/core';
import { MatomoTracker } from 'ngx-matomo';
import { AppSettings } from './app-settings';
import { Title } from '@angular/platform-browser';

@Injectable()
export class AnalyticsService {

  constructor(
    private settings: AppSettings,
    private titleService: Title,
    private matomoTracker: MatomoTracker
  ) { }

  sendEvent(category: string, action: string, label: string = '') {
    if (this.matomoAllowed()) {
      // console.log('analytics', 'sending matomo event ' + category + ' - ' + action + ' - ' + label);
      this.matomoTracker.trackEvent(category, action, label);
    }
    if (this.ga4Enabled()) {
      // console.log('-----analytics', 'sending ga4 event ' + category + ' - ' + action + ' - ' + label);
      let params = {
        'action_': `${action}`,
        'label_': `${label}`,
      }
      if (this.settings.ga4clientId) {
        params['client_'] = `${this.settings.ga4clientId}`;
      }
      if (this.settings.code) {
        params['code_'] = `${this.settings.code}`;
      }
      // console.log('sending event', params);
      (<any>window).gtag('event', `${category}_`, params);
    }
  }

  sendPageView(url: string) {
    if (this.matomoAllowed()) {
      // console.log('analytics', 'sending matomo page ' + url);
      this.matomoTracker.trackPageView(url);
    }
    if (this.ga4Enabled()) {
      // console.log('----analytics', 'sending ga4 page ' + url);
      let params = {
        'page_title': this.titleService.getTitle(),
        'page_path': url
      }
      if (this.settings.ga4clientId) {
        params['client_'] = `${this.settings.ga4clientId}`;
      }
      if (this.settings.code) {
        params['code_'] = `${this.settings.code}`;
      }
      // console.log('sending page_view', params);
      (<any>window).gtag('event', `page_view`, params);
    }
  }

  matomoAllowed(): boolean {
    return this.settings.matomo && (!this.settings.cookiebar || localStorage.getItem('cpref') == 'all' || localStorage.getItem('cpref') == 'analytical');
  }

  ga4Enabled(): boolean {
    return !!this.settings.ga4;
  }

  ga4Allowed(): boolean {
    return this.ga4Enabled() && (!this.settings.cookiebar || localStorage.getItem('cpref') == 'all' || localStorage.getItem('cpref') == 'analytical');
  }

}

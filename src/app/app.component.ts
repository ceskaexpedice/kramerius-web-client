import { AppSettings } from './services/app-settings';
import { HistoryService } from './services/history.service';
import { Component, OnInit } from '@angular/core';
import { Translator } from 'angular-translator';
import { Router, NavigationEnd } from '@angular/router';
import { AppState } from './app.state';
import { Location } from '@angular/common';
import { AuthService } from './services/auth.service';

import { MatomoInjector } from 'ngx-matomo';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  constructor(
    private translator: Translator,
    private location: Location,
    private history: HistoryService,
    private router: Router,
    private appSettings: AppSettings,
    private auth: AuthService,
    public state: AppState,
    private matomoInjector: MatomoInjector) {
      this.matomoInjector.init(this.appSettings.matomo_url, 5);
  }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        (<any>window).gaaa('set', 'page', event.urlAfterRedirects);
        (<any>window).gaaa('send', 'pageview');
        this.history.push(this.location.path());
        this.state.pageUrl = event.url;
      }
    });
    const lang = localStorage.getItem('lang');
    if (lang) {
      console.log("App component"); //dev
      this.appSettings.langs.forEach(element => {
        console.log(element);
      });
      console.log(lang);
      console.log(this.appSettings.langs[1]);
      console.log(lang == this.appSettings.langs[1]);
      this.translator.language = lang;
    }
  }
}

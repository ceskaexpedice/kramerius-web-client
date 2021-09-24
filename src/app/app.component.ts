import { AppSettings } from './services/app-settings';
import { HistoryService } from './services/history.service';
import { Component, OnInit } from '@angular/core';
import { Translator } from 'angular-translator';
import { Router, NavigationEnd } from '@angular/router';
import { AppState } from './app.state';
import { Location } from '@angular/common';

import { MatomoInjector } from 'ngx-matomo';
import { MzModalService } from 'ngx-materialize';
import { DialogDownloadComponent } from './dialog/dialog-download/dialog-download.component';
import { CookieService } from 'ngx-cookie-service';
import { AnalyticsService } from './services/analytics.service';

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
    private settings: AppSettings,
    private analytics: AnalyticsService,
    public state: AppState,
    private modalService: MzModalService,
    private cookieService : CookieService,
    private matomoInjector: MatomoInjector,
    private appSettings: AppSettings) {
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
    const lang = localStorage.getItem('lang');
    if (lang) {
      this.translator.language = lang;
    }

    this.openDownloadDialog()
  }

  openDownloadDialog(){
    var deviceInfo : string = navigator.userAgent;
    var device : string;

    if(this.appSettings.downloadApp && (deviceInfo.match(".*iPhone.*|.*iPad.*|.*Android.*") != null) && !this.cookieService.check("isOffered")){
      if(deviceInfo.match(".*Android.*") != null){
        device = "Android";
      }else device = "iPhone";
      this.modalService.open(DialogDownloadComponent, {title: "Chcete si nás uložit do mobilu?", 
                                                      message: "Mějte svou knihovnu vždy po ruce", 
                                                      button: "Zavřít",
                                                      imageURL: "assets/shared/img/app-promo.png",
                                                      deviceType: device});
      this.cookieService.set("isOffered", "offered");
    }

    
  }
}

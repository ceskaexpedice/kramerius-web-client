import { AppSettings } from '../services/app-settings';
import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../services/page-title.service';
import { AnalyticsService } from '../services/analytics.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-libraries',
  templateUrl: './libraries.component.html'
})
export class LibrariesComponent implements OnInit {


  constructor(
    public appSettings: AppSettings,
    public analytics: AnalyticsService,
    private pageTitle: PageTitleService,
    private _sanitizer: DomSanitizer
  ) {

  }

  ngOnInit() {
    this.pageTitle.setLandingPageTitle();
  }


  getThumb(kramerius) {
    return this._sanitizer.bypassSecurityTrustStyle(`url(${kramerius.logo})`);
  }




}

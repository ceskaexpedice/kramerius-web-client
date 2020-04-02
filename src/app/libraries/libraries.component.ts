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

  libraries = {};
  categories = ['major', 'regional', 'university', 'museum', 'archive', 'other'];
  constructor(
    public settings: AppSettings,
    public analytics: AnalyticsService,
    private pageTitle: PageTitleService,
    private _sanitizer: DomSanitizer
  ) {

  }

  ngOnInit() {
    this.pageTitle.setLandingPageTitle();
    this.categorize();
  }


  getThumb(kramerius) {
    return this._sanitizer.bypassSecurityTrustStyle(`url(${kramerius.logo})`);
  }


  private categorize() {
    for (const kramerius of this.settings.krameriusList) {
      const type = kramerius.type || 'other';
      if (!this.libraries[type]) {
        this.libraries[type] = [kramerius];
      } else {
        this.libraries[type].push(kramerius);
      }
    }
  }

}

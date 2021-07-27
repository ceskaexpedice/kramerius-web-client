import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AnalyticsService } from '../../services/analytics.service';
import { AppSettings } from '../../services/app-settings';
import { PageTitleService } from '../../services/page-title.service';

@Component({
  selector: 'app-signpost-libraries',
  templateUrl: './libraries.component.html',
  styleUrls: ['./libraries.component.scss']
})
export class SignpostLibrariesComponent implements OnInit {

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


  getThumb(url) {
    return this._sanitizer.bypassSecurityTrustStyle(`url(${url})`);
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

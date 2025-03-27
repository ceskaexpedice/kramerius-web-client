import { Component, OnInit } from '@angular/core';
import { AppSettings } from '../../services/app-settings';
import { TranslateService } from '@ngx-translate/core';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit {
  
  constructor(private settings: AppSettings, private translate: TranslateService, private analytics: AnalyticsService) { }

  ngOnInit() {
  }

  open() {
    this.analytics.sendEvent('home-banner', 'open', this.settings.code);
    window.open('https://forms.gle/q91VPGP7KzYAy17Q9', '_blank');
  }

  show() {
    this.analytics.sendEvent('home-banner', 'show', this.settings.code);
    return this.settings.formBanner && this.translate.currentLang === 'cs';
  }

}

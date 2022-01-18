import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AnalyticsService } from '../../services/analytics.service';
import { AppSettings } from '../../services/app-settings';

@Component({
  selector: 'app-signpost-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class SignpostHeaderComponent implements OnInit {

  constructor(public analytics: AnalyticsService, private translate: TranslateService,
    ) {
  }

  ngOnInit() {
  }

  languages(): string[] {
    return AppSettings.langs;
  }

  onLanguageChanged(lang: string) {
    this.analytics.sendEvent('landing', 'language', lang);
    localStorage.setItem('lang', lang);
    this.translate.use(lang);
  }

}

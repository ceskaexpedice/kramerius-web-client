import { Component, OnInit } from '@angular/core';
import { Translator } from 'angular-translator';
import { AnalyticsService } from '../../services/analytics.service';
import { AppSettings } from '../../services/app-settings';

@Component({
  selector: 'app-signpost-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class SignpostHeaderComponent implements OnInit {

  constructor(public analytics: AnalyticsService, public translator: Translator,
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
    this.translator.language = lang;
  }

}

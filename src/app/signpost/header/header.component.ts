import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AnalyticsService } from '../../services/analytics.service';
import { AppSettings } from '../../services/app-settings';
import { MatLegacyMenuTrigger as MatMenuTrigger } from '@angular/material/legacy-menu';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-signpost-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class SignpostHeaderComponent implements OnInit {

  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;

  constructor(public analytics: AnalyticsService, 
              private settings: AppSettings, 
              public languageService: LanguageService,
              private translate: TranslateService,
              @Inject(DOCUMENT) private document: Document) {
  }

  ngOnInit() {
  }

  languages(): string[] {
    return this.settings.languages;
  }

  closeMenu() {
    this.menuTrigger.closeMenu();
  }

  onLanguageChanged(lang: string) {
    this.analytics.sendEvent('landing', 'language', lang);
    if (!this.settings.cookiebar || localStorage.getItem('cpref') == 'all' || localStorage.getItem('cpref') == 'preferential') {
      localStorage.setItem('lang', lang);
    }
    this.translate.use(lang);
    this.document.documentElement.lang = lang; 
  }

}

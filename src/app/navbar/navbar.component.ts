import { AccountService } from './../services/account.service';
import { AnalyticsService } from './../services/analytics.service';
import { AuthService } from './../services/auth.service';
import { AppSettings } from './../services/app-settings';
import { LibrarySearchService } from './../services/library-search.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Translator } from 'angular-translator';
import { AppState } from '../app.state';
import { HistoryService } from '../services/history.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit {

  mobileSearchBarExpanded = false;
  richCollections = false;

  constructor(
    public translator: Translator,
    public router: Router,
    public authService: AuthService,
    public account: AccountService,
    public appSettings: AppSettings,
    private history: HistoryService,
    public service: LibrarySearchService,
    public analytics: AnalyticsService,
    public state: AppState) {
  }

  ngOnInit() {
  }

  onLanguageChanged(lang: string) {
    this.analytics.sendEvent('navbar', 'language', lang);
    localStorage.setItem('lang', lang);
    this.translator.language = lang;
  }

  goBack() {
    this.analytics.sendEvent('navbar', 'back');
    const page = this.history.pop();
    this.router.navigateByUrl(page);
  }

  toggleMobileSearchBar() {
    this.mobileSearchBarExpanded = !this.mobileSearchBarExpanded;
  }

  login() {
    if (this.appSettings.auth) {
      this.analytics.sendEvent('navbar', 'login-shib');
      const url = `${this.appSettings.auth.loginUrl}?target=${window.location.href}`;
      window.open(url, '_top');
    } else if (this.appSettings.krameriusLogin && !this.authService.isLoggedIn()) {
      this.analytics.sendEvent('navbar', 'login');
      this.authService.redirectUrl = window.location.href;  
      this.router.navigate(['/login']);
    }
  }

  logout() {
    if (this.appSettings.auth) {
      this.analytics.sendEvent('navbar', 'logout-shib');

      this.authService.logout(() => {
        const url = `${this.appSettings.auth.logoutUrl}?return=${window.location.href}`;
        window.open(url, '_top');
      });
    } else if (this.appSettings.krameriusLogin && this.authService.isLoggedIn()) {
      this.analytics.sendEvent('navbar', 'logout');
      this.authService.logout(() => {
        this.router.navigate(['/']);
      });
    } else if (this.account.serviceEnabled()) {
      this.analytics.sendEvent('navbar', 'logout-c');
      this.account.logout(() => {
        this.router.navigate(['/']);
      });
    }
  }

}

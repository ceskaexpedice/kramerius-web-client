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

  logout() {
    this.analytics.sendEvent('navbar', 'logout');
    if (this.account.serviceEnabled()) {
      this.account.logout(() => {
        this.router.navigate(['/']);
      });
    }
  }

  dnntLogout() {
    this.analytics.sendEvent('navbar', 'dnnt-logout');
    if (this.appSettings.dnnt) {
      this.authService.logout().subscribe(() => {
        window.open(this.appSettings.dnnt.logoutUrl, '_top');
      });
    }
  }


  dnntLogin() {
    if (this.appSettings.dnnt) {
      const url = `${this.appSettings.dnnt.loginUrl}?target=${window.location.pathname}${window.location.search}`;
      this.analytics.sendEvent('navbar', 'dnnt-login');
      window.open(this.appSettings.dnnt.loginUrl, '_top');
    }
 }


}

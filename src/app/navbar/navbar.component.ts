import { AnalyticsService } from './../services/analytics.service';
import { AuthService } from './../services/auth.service';
import { AppSettings } from './../services/app-settings';
import { LibrarySearchService } from './../services/library-search.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AppState } from '../app.state';
import { HistoryService } from '../services/history.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  mobileSearchBarExpanded = false;
  richCollections = false;

  constructor(
    public router: Router,
    public translate: TranslateService,
    public authService: AuthService,
    public appSettings: AppSettings,
    private history: HistoryService,
    public service: LibrarySearchService,
    public analytics: AnalyticsService,
    public state: AppState) {
  }

  ngOnInit() {
  }

  languages(): string[] {
    return AppSettings.langs;
  }

  onLanguageChanged(lang: string) {
    this.analytics.sendEvent('navbar', 'language', lang);
    localStorage.setItem('lang', lang);
    this.translate.use(lang);
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
      this.authService.redirectUrl = window.location.pathname;  
      this.router.navigate(['/login']);
    } else if (this.appSettings.k7 && !this.authService.isLoggedIn()) {
      this.analytics.sendEvent('navbar', 'login k7');
      this.authService.redirectUrl = window.location.pathname;  
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
    } else if (this.appSettings.k7 && this.authService.isLoggedIn()) {
      this.analytics.sendEvent('navbar', 'logout k7');
      this.authService.logout(() => {
        this.router.navigate(['/']);
      });
    }
  }

}

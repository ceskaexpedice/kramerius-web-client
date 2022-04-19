import { AnalyticsService } from './../services/analytics.service';
import { AuthService } from './../services/auth.service';
import { AppSettings } from './../services/app-settings';
import { LibrarySearchService } from './../services/library-search.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AppState } from '../app.state';
import { HistoryService } from '../services/history.service';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from '../services/local-storage.service';

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
    return this.appSettings.languages;
  }

  onLanguageChanged(lang: string) {
    this.analytics.sendEvent('navbar', 'language', lang);
    if (!this.appSettings.cookiebar || localStorage.getItem('cpref') == 'all' || localStorage.getItem('cpref') == 'preferential') {
      localStorage.setItem('lang', lang);
    }
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
      const url = `${this.appSettings.auth.loginUrl.replace(/\${LANG}/, this.translate.currentLang).replace(/\${TARGET}/, encodeURIComponent(window.location.href))}`;
      window.open(url, '_top');
    } else if (this.appSettings.krameriusLogin && !this.authService.isLoggedIn()) {
      this.analytics.sendEvent('navbar', 'login');
      this.authService.redirectUrl = window.location.pathname;  
      this.router.navigate(['/login']);
    } else if (this.appSettings.k7 && !this.authService.isLoggedIn()) {
      // this.analytics.sendEvent('navbar', 'login k7');
      // this.authService.redirectUrl = window.location.pathname;  
      // this.router.navigate(['/login']);
      const path = window.location.pathname + window.location.search;
      localStorage.setItem('login.url', path);
      // console.log('path', path);
      const url = `https://k7.inovatika.dev/auth/realms/kramerius/protocol/openid-connect/auth?client_id=krameriusClient&redirect_uri=http://localhost:4200/auth&response_type=code`;
      window.open(url, '_top');
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
        // this.router.navigate(['/']);
        window.location.reload();
      });
    }
  }

}

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
    public appSettings: AppSettings,
    private history: HistoryService,
    public service: LibrarySearchService,
    public state: AppState) {
  }

  ngOnInit() {
  }

  onLanguageChanged(lang: string) {
    localStorage.setItem('lang', lang);
    this.translator.language = lang;
  }

  goBack() {
    const page = this.history.pop();
    this.router.navigateByUrl(page);
  }

  toggleMobileSearchBar() {
    this.mobileSearchBarExpanded = !this.mobileSearchBarExpanded;
  }

}

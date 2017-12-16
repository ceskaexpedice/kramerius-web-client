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

  constructor(
    public translator: Translator,
    public router: Router,
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
    // console.log('history', this.history.pages);
    const page = this.history.pop();
    this.router.navigateByUrl(page);
  }



}

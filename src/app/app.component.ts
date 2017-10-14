import { Component, OnInit } from '@angular/core';
import { Translator } from 'angular-translator';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AppState } from './app.state';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(
    private translator: Translator,
    private route: ActivatedRoute,
    private router: Router, public state: AppState) {

    const lang = localStorage.getItem('lang');
    if (lang) {
      this.translator.language = lang;
    }
  }

  ngOnInit() {
    this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        this.state.activePage = val.url;
      }
    });
  }
}

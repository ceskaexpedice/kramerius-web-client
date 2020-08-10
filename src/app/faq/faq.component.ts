import { forkJoin } from 'rxjs/observable/forkJoin';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Translator } from 'angular-translator';
import { AppSettings } from '../services/app-settings';
import { Router } from '@angular/router';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html'
})
export class FaqComponent implements OnInit {

  data = '';
  dataCs = '';
  dataEn = '';
  loading: boolean;

  constructor(private http: HttpClient, private translator: Translator, private settings: AppSettings, private router: Router) {
    if (!settings.faqPage) {
      this.router.navigate([this.settings.getRouteFor('')]);
    }
  }

  ngOnInit() {
    this.loading = true;
    this.translator.languageChanged.subscribe(() => {
      this.localeChanged();
    });
    const reqCs = this.http.get(this.settings.faqPage['cs'], { observe: 'response', responseType: 'text' })
    .map(response => response['body']);
    const reqEn = this.http.get(this.settings.faqPage['en'], { observe: 'response', responseType: 'text' })
    .map(response => response['body']);
    forkJoin([reqCs, reqEn])
    .subscribe( result => {
      this.dataCs = result[0];
      this.dataEn = result[1];
      this.localeChanged();
      this.loading = false;
    },
    error => {
      this.loading = false;
    });
  }

  private localeChanged() {
    if (this.translator.language === 'cs') {
      this.data = this.dataCs;
    } else {
      this.data = this.dataEn;
    }
  }

}

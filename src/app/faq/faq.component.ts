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

  appSettings: AppSettings;
  reqs: Observable<string>[];
  dataArray: string[];
  dataSet: Map<string, string>;
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
    this.appSettings.faqPage.forEach(element => {
      this.reqs.push(this.http.get(element, { observe: 'response', responseType: 'text' })
      .map(response => response['body']));
    });
    forkJoin(this.reqs)
    .subscribe( result => {
      result.forEach(element => {
        this.dataArray.push(element);
      });
      Object.keys(this.appSettings.faqPage).map(function(e, i){
        this.dataMap.set(e, this.dataArray[i]);
      });
      this.localeChanged();
      this.loading = false;
    },
    error => {
      this.loading = false;
    });
  }

  private localeChanged() {
    this.data = this.dataSet.get(this.translator.language);
  }

}

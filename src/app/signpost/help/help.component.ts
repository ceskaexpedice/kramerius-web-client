import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Translator } from 'angular-translator';
import { AppSettings } from '../../services/app-settings';
import { PageTitleService } from '../../services/page-title.service';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'app-signpost-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class SignpostHelpComponent implements OnInit {

  reqs: Observable<string>[];
  dataArray: string[];
  dataSet: Map<string, string>;
  data = '';
  dataCs = '';
  dataEn = '';
  loading: boolean;

  constructor(
    private pageTitle: PageTitleService,
    private appSettings: AppSettings, private router: Router,
    private http: HttpClient, private translator: Translator
  ) {
    this.reqs = [];
    this.dataArray = [];
    this.dataSet = new Map<string, string>();
  }

  ngOnInit() {
    if (!this.appSettings.landingPage) {
      this.router.navigate([this.appSettings.getRouteFor('')]);
    }
    this.loading = true;
    this.translator.languageChanged.subscribe(() => {
      this.localeChanged();
    });
    for(const [key, element] of Object.entries(this.appSettings.aboutPage)){
        this.reqs.push(this.http.get(element, { observe: 'response', responseType: 'text' })
        .map(response => response['body']));
    }
    forkJoin(this.reqs)
    .subscribe( result => {
      for(const element in result)
        this.dataArray.push(result[element]);
      let keys = Object.keys(this.appSettings.aboutPage);
      for(let i = 0; i < this.dataArray.length; i++){
        this.dataSet.set(keys[i], this.dataArray[i]);
      }

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

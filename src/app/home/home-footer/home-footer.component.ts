import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from '../../services/app-settings';
import { Translator } from 'angular-translator';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'app-home-footer',
  templateUrl: './home-footer.component.html'
})
export class HomeFooterComponent implements OnInit {

  reqs: Observable<string>[];
  dataArray: string[];
  dataSet: Map<string, SafeHtml>;
  data;
  dataCs;
  dataEn ;

  constructor(private http: HttpClient, private translator: Translator, private appSettings: AppSettings, private _sanitizer: DomSanitizer) {
    this.reqs = [];
    this.dataArray = [];
    this.dataSet = new Map<string, string>();
  }

  ngOnInit() {
    this.translator.languageChanged.subscribe(() => {
      this.localeChanged();
    });
    for(const [key, element] of Object.entries(this.appSettings.footer)){
      this.reqs.push(this.http.get(element, { observe: 'response', responseType: 'text' })
      .map(response => response['body']));
    } 
    forkJoin(this.reqs)
    .subscribe( result => {
      for(const element in result)
        this.dataArray.push(result[element]);
      let keys = Object.keys(this.appSettings.aboutPage);
      for(let i = 0; i < this.dataArray.length; i++){
        this.dataSet.set(keys[i], this._sanitizer.bypassSecurityTrustHtml(this.dataArray[i]));
      }
      this.localeChanged();
    },
    error => {
    });
  }

  private localeChanged() {
    this.data = this.dataSet.get(this.translator.language);
  }

}

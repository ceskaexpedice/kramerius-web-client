import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from '../../services/app-settings';
import { Translator } from 'angular-translator';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-home-footer',
  templateUrl: './home-footer.component.html'
})
export class HomeFooterComponent implements OnInit {

  reqs: Observable<string>[];
  dataArray: string[];
  dataSet: Map<string, string>;
  data;
  dataCs;
  dataEn ;

  constructor(private http: HttpClient, private translator: Translator, private appSettings: AppSettings, private _sanitizer: DomSanitizer) {

  }

  ngOnInit() {
    this.translator.languageChanged.subscribe(() => {
      this.localeChanged();
    });
    this.appSettings.footer.forEach(element => {
      this.reqs.push(this.http.get(element, { observe: 'response', responseType: 'text' })
      .map(response => response['body']));
    });
    forkJoin(this.reqs)
    .subscribe( result => {
      result.forEach(element => {
        this.dataArray.push(element);
      });
      Object.keys(this.appSettings.footer).map(function(e, i){
        this.dataMap.set(e, this._sanitizer.bypassSecurityTrustHtml(this.dataArray[i]));
      });
      this.localeChanged();
    },
    error => {
    });
  }

  private localeChanged() {
    this.data = this.dataSet.get(this.translator.language);
  }

}

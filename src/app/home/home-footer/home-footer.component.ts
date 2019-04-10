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

  data;
  dataCs;
  dataEn ;

  constructor(private http: HttpClient, private translator: Translator, private appSettings: AppSettings, private _sanitizer: DomSanitizer) {

  }

  ngOnInit() {
    this.translator.languageChanged.subscribe(() => {
      this.localeChanged();
    });
    const reqCs = this.http.get(this.appSettings.footer['cs'], { observe: 'response', responseType: 'text' })
    .map(response => response['body']);
    const reqEn = this.http.get(this.appSettings.footer['en'], { observe: 'response', responseType: 'text' })
    .map(response => response['body']);
    forkJoin([reqCs, reqEn])
    .subscribe( result => {
      this.dataCs = this._sanitizer.bypassSecurityTrustHtml(result[0]);
      this.dataEn = this._sanitizer.bypassSecurityTrustHtml(result[1]);
      this.localeChanged();
    },
    error => {
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

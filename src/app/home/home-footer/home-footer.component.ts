import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from '../../services/app-settings';
import { forkJoin } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home-footer',
  templateUrl: './home-footer.component.html'
})
export class HomeFooterComponent implements OnInit {

  private dataSet: Map<string, SafeHtml>;
  data: SafeHtml;
  loading: boolean;

  constructor(private http: HttpClient, private translate: TranslateService, private appSettings: AppSettings, private _sanitizer: DomSanitizer) {
    this.dataSet = new Map<string, string>();
  }
  ngOnInit() {
    this.loading = true;
    this.translate.onLangChange.subscribe(() => {
      this.localeChanged();
    });
    const reqs = [];
    const dataArray = [];
    for(const [key, element] of Object.entries(this.appSettings.footer)){
        reqs.push(this.http.get(element, { observe: 'response', responseType: 'text' })
        .map(response => response['body']));
    }
    forkJoin(reqs)
    .subscribe( result => {
      for(const element in result) {
        dataArray.push(result[element]);
      }
      let keys = Object.keys(this.appSettings.footer);
      for(let i = 0; i < dataArray.length; i++){
        this.dataSet.set(keys[i], dataArray[i]);
        this.dataSet.set(keys[i], this._sanitizer.bypassSecurityTrustHtml(dataArray[i]));

      }
      this.localeChanged();
      this.loading = false;
    },
    error => {
      this.loading = false;
    });
  }

  private localeChanged() {
    if (this.dataSet.has(this.translate.currentLang)) {
      this.data = this.dataSet.get(this.translate.currentLang);
    } else {
      this.data = this.dataSet.get('en') || this.dataSet.get('cs')
    }
  }

}

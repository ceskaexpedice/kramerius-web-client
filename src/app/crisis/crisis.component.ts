import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from '../services/app-settings';
import { Translator } from 'angular-translator';
import { forkJoin } from 'rxjs/observable/forkJoin';

@Component({
  selector: 'app-crisis',
  templateUrl: './crisis.component.html',
  styleUrls: ['./crisis.component.scss']

})
export class CrisisComponent implements OnInit {

  data = '';
  dataCs = '';
  dataEn = '';
  loading: boolean;

  constructor(private router: Router, private http: HttpClient, private appSettings: AppSettings, private translator: Translator) {

   }

  ngOnInit() {
    this.loading = true;
    this.translator.languageChanged.subscribe(() => {
      this.localeChanged();
    });
    const reqCs = this.http.get(this.appSettings.crisisInfo['cs'], { observe: 'response', responseType: 'text' })
    .map(response => response['body']);
    const reqEn = this.http.get(this.appSettings.crisisInfo['en'], { observe: 'response', responseType: 'text' })
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


  approve() {
    localStorage.setItem("crisis_approved", "yes");
    const url = localStorage.getItem("crisis_url") || '/';
    this.router.navigateByUrl(url);
  }

}

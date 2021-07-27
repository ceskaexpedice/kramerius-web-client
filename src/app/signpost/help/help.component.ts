import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Translator } from 'angular-translator';
import { AppSettings } from '../../services/app-settings';
import { PageTitleService } from '../../services/page-title.service';
import { forkJoin } from 'rxjs/observable/forkJoin';

@Component({
  selector: 'app-signpost-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class SignpostHelpComponent implements OnInit {

  data = '';
  dataCs = '';
  dataEn = '';
  loading: boolean;

  constructor(
    private pageTitle: PageTitleService,
    private appSettings: AppSettings, private router: Router,
    private http: HttpClient, private translator: Translator
  ) {

  }

  ngOnInit() {
    if (!this.appSettings.landingPage) {
      this.router.navigate([this.appSettings.getRouteFor('')]);
    }
    this.pageTitle.setLandingPageTitle("help");
    this.loading = true;
    this.translator.languageChanged.subscribe(() => {
      this.localeChanged();
    });
    const reqCs = this.http.get('/assets/shared/sp/help.cs.html', { observe: 'response', responseType: 'text' })
    .map(response => response['body']);
    const reqEn = this.http.get('/assets/shared/sp/help.en.html', { observe: 'response', responseType: 'text' })
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

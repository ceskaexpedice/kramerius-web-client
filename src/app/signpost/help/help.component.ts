import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from '../../services/app-settings';
import { PageTitleService } from '../../services/page-title.service';

@Component({
  selector: 'app-signpost-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class SignpostHelpComponent implements OnInit {


  data = '';
  loading: boolean;

  constructor(private http: HttpClient, private pageTitle: PageTitleService, private translate: TranslateService, private appSettings: AppSettings, private router: Router) {
    if (!appSettings.landingPage) {
      this.router.navigate([this.appSettings.getRouteFor('')]);
    }
  }
  ngOnInit() {
    if (!this.appSettings.landingPage) {
      this.router.navigate([this.appSettings.getRouteFor('')]);
    }
    this.pageTitle.setTitle('help', null);
    this.translate.onLangChange.subscribe(() => {
      this.localeChanged();
    });
    this.localeChanged();
  }

  private localeChanged() {
    this.loading = true;
    const res = `/assets/shared/sp/help.${this.translate.currentLang}.html`;
    this.http.get(res, { observe: 'response', responseType: 'text' }).subscribe(response => {
      this.data = response['body'];
      this.loading = false;
    },
    (error) => {
      this.data = "";
    });
  }

}

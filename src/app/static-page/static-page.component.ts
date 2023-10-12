import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from '../services/app-settings';
import { ActivatedRoute, Router } from '@angular/router';
import { PageTitleService } from '../services/page-title.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-static-page',
  templateUrl: './static-page.component.html',
  styleUrls: ['./static-page.component.scss']
})
export class StaticPageComponent implements OnInit {
  
  data = '';
  data2 = '';
  loading: boolean;
  page: string;
  termsAgreed: boolean;

  constructor(private http: HttpClient,
              private pageTitle: PageTitleService, 
              private translate: TranslateService, 
              private auth: AuthService,
              private settings: AppSettings, 
              private route: ActivatedRoute,
              private router: Router) {
  }


  ngOnInit() {
    this.loading = true;
    this.route.data.subscribe(data => {
      this.page = data['page'];
      const pageDef: [string, string] = this.settings[this.page + 'Page'];
      if (!pageDef) {
        this.router.navigate([this.settings.getRouteFor('')]);
      }
      this.pageTitle.setTitle(this.page, null);
      this.loading = true;
      this.translate.onLangChange.subscribe(() => {
        this.localeChanged();
      });
      this.localeChanged();
    });
    this.route.queryParams.subscribe(params => {
      const redirectPath = params['redirect_path'];
      if (redirectPath) {
        localStorage.setItem('login.url', redirectPath);
      }
    });
  }

  private localeChanged() {
    this.loading = true;
    const pageDef: [string, string] = this.settings[this.page + 'Page'];
    console.log('pageDef', pageDef);
    const url = pageDef[this.translate.currentLang] || pageDef['cs'];
    console.log('url', url);  
    this.http.get(url, { observe: 'response', responseType: 'text' }).subscribe(response => {
      this.data = response['body'];
      this.loading = false;
    }, error => {
      this.loading = false;
    });
    const pageDef2: [string, string] = this.settings[this.page + 'Page2'];
    if (pageDef2) {
      const url2 = pageDef2[this.translate.currentLang] || pageDef2['cs'];
      this.http.get(url2, { observe: 'response', responseType: 'text' }).subscribe(response => {
        this.data2 = response['body'];
        this.loading = false;
      }, error => {
        this.loading = false;
      });
    }
  }

  login() {
    if (this.termsAgreed) {
      this.auth.login();
    }
  }

  termsUrl(): string {
    if (!this.settings.termsUrl) {
      return null;
    }
    const pageDef: [string, string] = this.settings.termsUrl;
    return pageDef[this.translate.currentLang] || pageDef['cs'];
  }

}

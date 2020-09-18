import { forkJoin } from 'rxjs/observable/forkJoin';
import { AppSettings } from './../services/app-settings';
import { LocalStorageService } from './../services/local-storage.service';
import { DocumentItem } from './../model/document_item.model';
import { KrameriusApiService } from './../services/kramerius-api.service';
import { Component, OnInit } from '@angular/core';
import { AppState } from '../app.state';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Translator } from 'angular-translator';
import { PageTitleService } from '../services/page-title.service';
import { AnalyticsService } from '../services/analytics.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  newest: DocumentItem[];
  recommended: DocumentItem[];
  visited: DocumentItem[];
  selectedTab = 'none';
  step = 6;
  page = 1;
  lastCode: string;
  showFooter: boolean;

  data = '';
  dataCs = '';
  dataEn = '';

  constructor(
    private http: HttpClient, private translator: Translator,
    public state: AppState,
    private route: ActivatedRoute,
    private router: Router,
    public settings: AppSettings,
    private krameriusApiService: KrameriusApiService,
    private localStorageService: LocalStorageService,
    public analytics: AnalyticsService,
    private pageTitle: PageTitleService
  ) {
    if (!settings.footer) {
    //  this.router.navigate([this.settings.getRouteFor('')]);
    }
  }

  ngOnInit() {

      this.translator.languageChanged.subscribe(() => {
        this.localeChanged();
      });
      if (this.settings.footer) {
        const reqCs = this.http.get(this.settings.footer['cs'], { observe: 'response', responseType: 'text' })
        .map(response => response['body']);
        const reqEn = this.http.get(this.settings.footer['en'], { observe: 'response', responseType: 'text' })
        .map(response => response['body']);
        forkJoin([reqCs, reqEn])
        .subscribe( result => {
          this.dataCs = result[0];
          this.dataEn = result[1];
          this.showFooter=true;
          this.localeChanged();
        },
        error => {
          this.showFooter=false;
        });
      }

    this.pageTitle.setTitle(null, null);
    this.showFooter = !!this.settings.footer;
    if (this.settings.multiKramerius) {
      this.route.params.subscribe(params => {
        if (params && params['k'] && params['k'] !== this.lastCode) {
          this.lastCode = params['k'];
          this.reloadData();
        }
      });
    } else {
      this.reloadData();
    }
  }

  private localeChanged() {
    if (this.translator.language === 'cs') {
      this.data = this.dataCs;
    } else {
      this.data = this.dataEn;
    }
  }

  private reloadData() {
    this.getVisited();
    this.getNewest();
    this.getRecommended();
  }

  getActiveItems(): DocumentItem[] {
    const items: DocumentItem[] = [];
    const list = this.getActiveList();
    if (!list) {
      return items;
    }
    let from = this.step * (this.page - 1);
    let to = from + this.step;
    if (from < 0) {
      from = 0;
    }
    if (to > list.length) {
      to = list.length;
    }
    for (let i = from; i < to; i++) {
      items.push(list[i]);
    }
    return items;
  }

  getActiveList(): DocumentItem[] {
    if (this.selectedTab === 'visited') {
      return this.visited;
    } else if (this.selectedTab === 'newest') {
      return this.newest;
    } else if (this.selectedTab === 'recommended') {
      return this.recommended;
    }
  }

  getNumberOfActiveItems() {
    const list = this.getActiveList();
    if (list) {
      return list.length;
    } else {
      return 0;
    }
  }

  changeTab(tab: string) {
    this.analytics.sendEvent('home', 'tab', tab);
    this.localStorageService.setProperty(LocalStorageService.FEATURED_TAB, tab);
    this.page = 1;
    this.selectedTab = tab;
  }

  getNewest() {
    this.krameriusApiService.getNewest().subscribe(response => {
      this.newest = response; // .slice(0, 6);
    });
  }

  getRecommended() {
    this.krameriusApiService.getRecommended().subscribe(response => {
      this.recommended = response; // .slice(0, 6);
    });
  }

  getVisited() {
    this.visited = this.localStorageService.getVisited(); // .slice(0, 6);
    this.selectedTab = this.localStorageService.getProperty(LocalStorageService.FEATURED_TAB);
    if (this.selectedTab !== 'visited' && this.selectedTab !== 'newest' && this.selectedTab !== 'recommended') {
      if (this.visited.length >= 3) {
        this.selectedTab = 'visited';
      } else {
        this.selectedTab = 'newest';
      }
    }
  }

}

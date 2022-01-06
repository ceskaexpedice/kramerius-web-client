import { AppSettings } from './../services/app-settings';
import { LocalStorageService } from './../services/local-storage.service';
import { DocumentItem } from './../model/document_item.model';
import { KrameriusApiService } from './../services/kramerius-api.service';
import { Component, OnInit } from '@angular/core';
import { AppState } from '../app.state';
import { ActivatedRoute } from '@angular/router';
import { PageTitleService } from '../services/page-title.service';
import { AnalyticsService } from '../services/analytics.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
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

  constructor(
    public state: AppState,
    private route: ActivatedRoute,
    public settings: AppSettings,
    private api: KrameriusApiService,
    private localStorageService: LocalStorageService,
    public analytics: AnalyticsService,
    private pageTitle: PageTitleService
  ) {

  }

  ngOnInit() {
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
    this.api.getNewest().subscribe((newest: DocumentItem[]) => {
      this.newest = newest;
    });
  }

  getRecommended() {
    if (this.settings.k5Compat()) {
      this.api.getRecommended().subscribe(response => {
        this.recommended = response; // .slice(0, 6);
      });
    } else {
      this.recommended = [];
    }
  }

  getVisited() {
    this.visited = this.localStorageService.getVisited();
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

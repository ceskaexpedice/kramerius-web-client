import { LocalStorageService } from './../services/local-storage.service';
import { DocumentItem } from './../model/document_item.model';
import { KrameriusApiService } from './../services/kramerius-api.service';
import { Component, OnInit } from '@angular/core';
import { AppState } from '../app.state';

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

  constructor(
    public state: AppState,
    private krameriusApiService: KrameriusApiService,
    private localStorageService: LocalStorageService
  ) {

  }

  ngOnInit() {
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

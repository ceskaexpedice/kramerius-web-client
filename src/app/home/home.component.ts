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


  changeTab(tab: string) {
    this.localStorageService.setProperty(LocalStorageService.FEATURED_TAB, tab);
    this.selectedTab = tab;
  }

  getNewest() {
    this.krameriusApiService.getNewest().subscribe(response => {
      this.newest = response.slice(0, 6);
    });
  }

  getRecommended() {
    this.krameriusApiService.getRecommended().subscribe(response => {
      this.recommended = response.slice(0, 6);
    });
  }

  getVisited() {
    this.visited = this.localStorageService.getVisited().slice(0, 6);
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

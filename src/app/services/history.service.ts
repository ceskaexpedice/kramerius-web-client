import { AppSettings } from './app-settings';
import { Injectable } from '@angular/core';

@Injectable()
export class HistoryService {

  pages: string[];

  constructor(private appSettings: AppSettings) {
    this.pages = [];
  }

  pop(): string {
    if (this.empty()) {
      this.pages = [];
      return this.appSettings.getRouteFor('/');
    } else {
      return this.pages.splice(this.pages.length - 2, 2)[0];
    }
  }

  removeCurrent() {
    if (this.pages.length > 0) {
      this.pages.splice(-1, 1);
    }
  }

  empty(): boolean {
    return this.pages.length < 2;
  }

  push(page: string) {
    if (this.pages.length > 0) {
      const last = this.pages[this.pages.length - 1];
      const searchPath = this.appSettings.getRouteFor('search');
      const browsePath = this.appSettings.getRouteFor('browse');
      if ((last.startsWith(searchPath) && page.startsWith(searchPath)) ||
           last.startsWith(browsePath) && page.startsWith(browsePath)) {
        this.removeCurrent();
      }
    }
    this.pages.push(page);
  }

}

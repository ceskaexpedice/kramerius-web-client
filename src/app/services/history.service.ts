import { Injectable } from '@angular/core';

@Injectable()
export class HistoryService {

  pages: string[];

  constructor() {
    this.pages = [];
  }

  pop(): string {
    if (this.empty()) {
      this.pages = [];
      return '/';
    } else {
      return this.pages.splice(this.pages.length - 2, 2)[0];
    }
  }

  empty(): boolean {
    return this.pages.length < 2;
  }

  push(page: string) {
    if (this.pages.length > 0) {
      const last = this.pages[this.pages.length - 1];
      if ((last.startsWith('/search') && page.startsWith('/search')) ||
           last.startsWith('/browse') && page.startsWith('/browse')) {
        this.pages.pop();
      }
    }
    this.pages.push(page);
  }

}

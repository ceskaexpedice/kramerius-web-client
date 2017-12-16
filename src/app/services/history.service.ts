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

  push(page) {
    this.pages.push(page);
  }

}

import { AppSettings } from './app-settings';
import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Translator } from 'angular-translator';

@Injectable()
export class PageTitleService {

  private part1: string;
  private part2: string;
  private landing = false;

  constructor(private titleService: Title,
    private appSettings: AppSettings,
    private translator: Translator) {
    this.translator.languageChanged.subscribe(() => {
      if (this.landing) {
        this.setLandingPageTitle();
      } else {
        this.setTitle(this.part1, this.part2);
      }
    });
  }

  setTitle(part1: string, part2: string) {
    this.landing = false;
    this.part1 = part1;
    this.part2 = part2;
    this.translator.waitForTranslation().then(() => {
      let title = <string> this.translator.instant('title.main');
      title = this.appSettings.title + ' | ' + title;
      if (part1 && part1.length > 0) {
        title = <string> this.translator.instant('title.' + part1) + ' | ' + title;
      }
      if (part2 && part2.length > 0) {
        title = part2 +  ' | ' + title;
      }
      this.titleService.setTitle(title);
    });
  }

  setLandingPageTitle() {
    this.landing = true;
    this.translator.waitForTranslation().then(() => {
      let title = <string> this.translator.instant('title.main');
      this.titleService.setTitle(title);
    });
  }

}

import { AppSettings } from './app-settings';
import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class PageTitleService {

  private part1: string;
  private part2: string;
  private landing = false;

  constructor(private titleService: Title,
    private appSettings: AppSettings,
    private translate: TranslateService) {
    this.translate.onLangChange.subscribe(() => {
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
    let title = <string> this.translate.instant('title.main');
    title = this.appSettings.title + ' | ' + title;
    if (part1 && part1.length > 0) {
      title = <string> this.translate.instant('title.' + part1) + ' | ' + title;
    }
    if (part2 && part2.length > 0) {
      title = part2 +  ' | ' + title;
    }
    this.titleService.setTitle(title);
  }

  setLandingPageTitle(part: string = null) {
    this.landing = true;
    let title = <string> this.translate.instant('title.main');
    if (part) {
      title = <string> this.translate.instant('title.' + part) + ' | ' + title;
    }
    this.titleService.setTitle(title);
  }

}

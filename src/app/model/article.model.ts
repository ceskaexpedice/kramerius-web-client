import { Page } from './page.model';

export class Article {
  uuid: string;
  title: string;
  policy: string;
  pages: Page[];
  type: string; // none | pdf | pages

  constructor(uuid?: string, title?: string, policy?: string) {
    this.uuid = uuid;
    this.title = title;
    this.policy = policy;
    this.type = 'none';
  }

}

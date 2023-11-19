import { Metadata } from './metadata.model';

export class Article {
  uuid: string;
  title: string;
  policy: string;
  firstPageUuid: string;
  type: string; // none | pdf | pages
  metadata: Metadata;
  licences: string[] = [];

  constructor(uuid?: string, title?: string, policy?: string) {
    this.uuid = uuid;
    this.title = title;
    this.policy = policy;
    this.type = 'none';
  }

}

import { Metadata } from './metadata.model';
import { Page } from './page.model';

export class InternalPart {
  uuid: string;
  title: string;
  policy: string;
  firstPageUuid: string;
  type: string; // none | pdf | pages
  metadata: Metadata;

  constructor(uuid?: string, title?: string, policy?: string) {
    this.uuid = uuid;
    this.title = title;
    this.policy = policy;
    this.type = 'none';
  }

}

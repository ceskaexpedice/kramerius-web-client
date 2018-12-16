import { Metadata } from './metadata.model';

export class InternalPart {
  uuid: string;
  title: string;
  policy: string;
  firstPageUuid: string;
  metadata: Metadata;

  constructor(uuid?: string, title?: string, policy?: string) {
    this.uuid = uuid;
    this.title = title;
    this.policy = policy;
  }

}

import { Injectable } from '@angular/core';
import { AppSettings } from './app-settings';

@Injectable()
export class ShareService {

  constructor(private appSettings: AppSettings) { }


  getPersistentLink(uuid: string): string {
    if (!uuid) {
      return;
    }
    let url: string;
    if (this.appSettings.share_url) {
      if (this.appSettings.multiKramerius) {
        url = this.appSettings.share_url.replace(/\$\{UUID\}/, uuid).replace(/\$\{KRAMERIUS\}/, this.appSettings.code);
      } else {
        url = this.appSettings.share_url.replace(/\$\{UUID\}/, uuid);
      }
    } else {
      if (this.appSettings.multiKramerius) {
        url = location.protocol + '//' + location.host + '/' + this.appSettings.code + '/uuid/' + uuid;
      } else {
        url = location.protocol + '//' + location.host + '/uuid/' + uuid;
      }
    }
    return url;
  }

  getPersistentLinkByUrl(): string {
    return this.getPersistentLink(AppSettings.getUuidFromUrl());
  }

  getPersistentLinkForFolder(uuid: string): string {
    if (!uuid) {
      return;
    }
    let url: string;
    if (this.appSettings.multiKramerius) {
      url = location.protocol + '//' + location.host + '/' + this.appSettings.code + '/folders/' + uuid;
    } else {
      url = location.protocol + '//' + location.host + '/folders/' + uuid;
    }
    return url;
  }

}

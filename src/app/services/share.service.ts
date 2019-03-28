import { Injectable } from '@angular/core';
import { AppSettings } from './app-settings';
import { DialogShareComponent } from '../dialog/dialog-share/dialog-share.component';
import { MzModalService } from 'ngx-materialize';


@Injectable()
export class ShareService {

  constructor(private appSettings: AppSettings, private modalService: MzModalService) { }

  getPagePersistentLink(): string {
    const path = location.pathname;
    const query = location.search;
    let uuid: string;
    if (path.indexOf('uuid:') > -1) {
      uuid = path.substr(path.indexOf('uuid:'));
    }
    if (query.indexOf('article=uuid:') > -1) {
      uuid = this.parseUuid(query, 'article');
    }
    if (query.indexOf('page=uuid:') > -1) {
      uuid = this.parseUuid(query, 'page');
    }
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

  private parseUuid(query: string, param: string) {
    for (const p of query.split('&')) {
      if (p.indexOf(param + '=') > -1) {
        return p.substring(p.indexOf(param + '=') + param.length + 1);
      }
    }
  }

  public showShareDialog() {
    const link = this.getPagePersistentLink();
    if (link) {
      const options = {
        link: link
      };
      this.modalService.open(DialogShareComponent, options);
    }
  }


}

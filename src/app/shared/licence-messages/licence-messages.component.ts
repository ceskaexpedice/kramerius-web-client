import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { KrameriusInfo } from '../../model/krameriusInfo.model';
import { AppSettings } from '../../services/app-settings';
import { KrameriusInfoService } from '../../services/kramerius-info.service';
import { LicenceService } from '../../services/licence.service';

@Component({
  selector: 'app-licence-messages',
  templateUrl: './licence-messages.component.html',
  styleUrls: ['./licence-messages.component.scss']

})
export class LicenceMessagesComponent implements OnInit {
  
  @Input() licences: string[];
  @Input() full: boolean;

  loading: boolean;
  html;

  constructor(private krameriusInfo: KrameriusInfoService, private settings: AppSettings, private licenceService: LicenceService, private translate: TranslateService, private http: HttpClient) { }

  ngOnInit() {
    this.translate.onLangChange.subscribe(() => {
      this.reload();
    });
    this.reload();
  }

  private reload() {
    this.html = "";
    if (!this.licenceService.on()) {
      if (this.settings.customRightMessage) {
        this.loadKrameriusMessage();
      } else {
        this.html = `<h3>${this.translate.instant("licence.private_label")}</h3>`;
        this.html += this.translate.instant("licence.private_message");
      }
      return;
    }
    const licences = this.licenceService.availableLicences(this.licences);
    if (this.full) {
      this.html += `<h3>${this.translate.instant("licence.private_label")}</h3>`;
    }
    if (this.full && licences.length > 0) {
      this.html += `<div class="app-licence-hint">${this.translate.instant("licence.licences_before")}</div>`;
      this.loadLicences(licences, () => {
        this.html += `<div class="app-licence-hint">${this.translate.instant("licence.licences_after")}</div>`;
        this.loadLicences(['_private'], () => {
          this.loading = false;
        });
      });
    } else if (!this.full) {
      this.loadLicences(licences, () => {
        this.loading = false;
      });
    } else {
      this.loadLicences(['_private'], () => {
        this.loading = false;
      });
    }
  }

  private loadKrameriusMessage() {
    this.krameriusInfo.data$.subscribe((info: KrameriusInfo) => {
      this.html = "";
      if (info.rightMsg) {
        const uuid = this.getUuidFromUrl();
        this.html += info.rightMsg.replace(/\${UUID}/g, uuid);
      }
    });
  }

  private loadLicences(licences: string[], callback: () => void) {
    const uuid = this.getUuidFromUrl();
    const licence = licences.shift();
    const url = this.licenceService.message(licence);
    this.http.get(url, { observe: 'response', responseType: 'text' }).pipe(map(response => response['body'])).subscribe((result) => {
      if (licence != "_private") {
        this.html += `<h5>${this.licenceService.label(licence)}</h5>`;
      }
      this.html += result.replace(/\${UUID}/g, uuid);;
      if (licences.length > 0) {
        this.loadLicences(licences, callback);
      } else {
        callback();
      }
    })
  }

  private getUuidFromUrl() {
    const path = location.pathname;
    const query = location.search;
    let uuid = "";
    if (path.indexOf('uuid:') > -1) {
      uuid = path.substr(path.indexOf('uuid:'));
    }
    if (query.indexOf('article=uuid:') > -1) {
      uuid = this.parseUuid(query, 'article');
    }
    if (query.indexOf('page=uuid:') > -1) {
      uuid = this.parseUuid(query, 'page');
    }
    return uuid;
  }

  private parseUuid(query: string, param: string) {
    for (const p of query.split('&')) {
      if (p.indexOf(param + '=') > -1) {
        return p.substring(p.indexOf(param + '=') + param.length + 1);
      }
    }
  }

}

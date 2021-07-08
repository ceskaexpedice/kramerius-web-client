import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input } from '@angular/core';
import { Translator } from 'angular-translator';
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

  constructor(private licenceService: LicenceService, private translator: Translator, private http: HttpClient) { }

  ngOnInit() {
    this.translator.languageChanged.subscribe(() => {
      this.reload();
    });
    this.reload();
  }

  private reload() {
    const licences = this.licenceService.availableLicences(this.licences);
    this.html = "";
    if (this.full) {
      this.html += "<h3>Dokument není veřejně dostupný</h3>";
    }
    if (this.full && licences.length > 0) {
      this.html += "<strong><i>Tento dokument spadá pod následující licence:</i></strong><br/>";
      this.loadLicences(licences, () => {
        this.html += "<br/><strong><i>Pokud se k dokumentu nemůžete dostat v rámci licencí, pak platí obecná pravidla pro veřejně nedostupné dokumenty:</i></strong>";
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

  private loadLicences(licences: string[], callback: () => void) {
    const uuid = this.getUuidFromUrl();
    const licence = licences.shift();
    const url = this.licenceService.message(licence);
    this.http.get(url, { observe: 'response', responseType: 'text' }).map(response => response['body']).subscribe((result) => {
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

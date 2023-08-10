import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { AppSettings } from '../../services/app-settings';
import { KrameriusInfoService } from '../../services/kramerius-info.service';
import { LicenceService } from '../../services/licence.service';
import { MatDialog } from '@angular/material/dialog';
import { AnalyticsService } from '../../services/analytics.service';
import { LicenceDialogComponent } from '../../dialog/licence-dialog/licence-dialog.component';

@Component({
  selector: 'app-licence-window',
  templateUrl: './licence-window.component.html',
  styleUrls: ['./licence-window.component.scss']

})
export class LicenceWindowComponent implements OnInit {
  
  @Input() licences: string[];

  avaliableLicences: string[];

  instructions: any;

  text: string;

  constructor(private dialog: MatDialog,
    private analytics: AnalyticsService, private settings: AppSettings, public licenceService: LicenceService, private translate: TranslateService, private http: HttpClient) { }

  ngOnInit() {
    this.instructions = {};
    this.avaliableLicences = this.licenceService.availableLicences(this.licences, this.settings.ignorePolicyFlag);
    this.translate.onLangChange.subscribe(() => {
      this.reload();
    });
    this.reload();
  }

  private reload() {
    for(let licence of this.avaliableLicences) {
      this.instructions[licence] = "";
      this.http.get(this.licenceService.instruction(licence), { observe: 'response', responseType: 'text' }).pipe(map(response => response['body'])).subscribe((result) => {
        this.instructions[licence] = result;
      });
    }
    const cm = this.settings.copyrightedText;
    const lang = this.translate.currentLang;
    if (cm) {
      const url = cm[lang] || cm['en'] || cm['cs'];
      this.http.get(url, { observe: 'response', responseType: 'text' }).pipe(map(response => response['body'])).subscribe((result) => {
        this.text = result;
      });
    } else {
      this.text = '<p>' + this.translate.instant("licence.window.default_text") + '</p>';
    }
  }


  openLicenceDialog(licence: string) {
    this.analytics.sendEvent('license-window', 'licence-dialog', licence);
    this.dialog.open(LicenceDialogComponent, { data: { licence: licence }, autoFocus: false });
  }

  // private reload() {
  //   this.html = "";
  //   if (!this.licenceService.on()) {
  //     if (this.settings.customRightMessage) {
  //       this.loadKrameriusMessage();
  //     } else {
  //       this.html = `<h3>${this.translate.instant("licence.private_label")}</h3>`;
  //       this.html += this.translate.instant("licence.private_message");
  //     }
  //     return;
  //   }
  //   const licences = this.licenceService.availableLicences(this.licences, true);
  //   if (this.full) {
  //     this.html += `<h3>${this.translate.instant("licence.private_label")}</h3>`;
  //   }
  //   if (this.full && licences.length > 0) {
  //     this.html += `<div class="app-licence-hint">${this.translate.instant("licence.licences_before")}</div>`;
  //     this.loadLicences(licences, () => {
  //       if (!this.settings.ignorePolicyFlag) {
  //         this.html += `<div class="app-licence-hint">${this.translate.instant("licence.licences_after")}</div>`;
  //         this.loadLicences(['_private'], () => {
  //           this.loading = false;
  //         });
  //       } else {
  //         this.loading = false;
  //       }
  //     });
  //   } else if (!this.full) {
  //     this.loadLicences(licences, () => {
  //       this.loading = false;
  //     });
  //   } else if (!this.settings.ignorePolicyFlag) {
  //     this.loadLicences(['_private'], () => {
  //       this.loading = false;
  //     });
  //   }
  // }

  // private reload() {
  //   this.html = "";
  //   if (!this.licenceService.on()) {
  //     if (this.settings.customRightMessage) {
  //       this.loadKrameriusMessage();
  //     } else {
  //       this.html = `<h3 class="app-main-title">${this.translate.instant("licence.private_label")}</h3>`;
  //       this.html += this.translate.instant("licence.private_message");
  //     }
  //     return;
  //   }
  //   const licences = this.licenceService.availableLicences(this.licences, true);
  //   if (this.full) {
  //     this.html += `<h3 class="app-main-title">${this.translate.instant("licence.private_label")}</h3>`;
  //   }
  //   if (this.full && licences.length > 0) {
  //     // this.html += `<div class="app-licence-hint">${this.translate.instant("licence.licences_before")}</div>`;
  //     this.loadLicences(licences, () => {
  //       if (!this.settings.ignorePolicyFlag) {
  //         // this.html += `<div class="app-licence-hint">${this.translate.instant("licence.licences_after")}</div>`;
  //         this.loadLicences(['_private'], () => {
  //           this.loading = false;
  //         });
  //       } else {
  //         this.loading = false;
  //       }
  //     });
  //   } else if (!this.full) {
  //     this.loadLicences(licences, () => {
  //       this.loading = false;
  //     });
  //   } else if (!this.settings.ignorePolicyFlag) {
  //     this.loadLicences(['_private'], () => {
  //       this.loading = false;
  //     });
  //   }
  // }

  // private loadKrameriusMessage() {
  //   this.krameriusInfo.data$.subscribe((info: KrameriusInfo) => {
  //     this.html = "";
  //     if (info.rightMsg) {
  //       const lang = this.translate.currentLang;
  //       const uuid = AppSettings.getUuidFromUrl();
  //       const path = encodeURIComponent(this.settings.getRelativePath());
  //       const target = encodeURIComponent(window.location.href)
  //       this.html += info.rightMsg
  //         .replace(/\${LANG}/g, lang)
  //         .replace(/\${TARGET}/g, target)
  //         .replace(/\${PATH}/g, path)
  //         .replace(/\${UUID}/g, uuid);
  //     }
  //   });
  // }

  // private loadLicences(licences: string[], callback: () => void) {
  //   const licence = licences.shift();
  //   const url = this.licenceService.message(licence);
  //   this.http.get(url, { observe: 'response', responseType: 'text' }).pipe(map(response => response['body'])).subscribe((result) => {
  //     if (licence != "_private") {
  //       this.html += `<h5>${this.licenceService.label(licence)}</h5>`;
  //     }
  //     const lang = this.translate.currentLang;
  //     const uuid = AppSettings.getUuidFromUrl();
  //     const path = encodeURIComponent(this.settings.getRelativePath());
  //     const target = encodeURIComponent(window.location.href)
  //     this.html += result
  //     .replace(/\${LANG}/g, lang)
  //     .replace(/\${TARGET}/g, target)
  //     .replace(/\${PATH}/g, path)
  //     .replace(/\${UUID}/g, uuid);
  //     if (licences.length > 0) {
  //       this.loadLicences(licences, callback);
  //     } else {
  //       callback();
  //     }
  //   })
  // }


}

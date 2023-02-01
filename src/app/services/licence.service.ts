import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from './app-settings';


@Injectable()
export class LicenceService {

  userLicences: string[];
  licences: any;

  constructor(private translate: TranslateService, private settings: AppSettings) {
    this.userLicences = ['_public'];
    this.assignLicences(this.settings.licences);
    this.settings.kramerius$.subscribe(() =>  {
      this.assignLicences(this.settings.licences);
    });
  }

  assignLicences(licences: any) {
      this.licences = licences || {};
      this.licences['_public'] = {
        access: 'open',
        label: {
          cs: 'Dokument je veřejně dostupný',
          en: 'The document is publicly accessible'
        }
      }
  }

  assignUserLicences(licences: string[]) {
    this.userLicences = this.availableLicences(['_public'].concat(licences || []));
  }

  // 0 --- undefined
  // 1 --- show
  // 2 --- hide
  action(licence: string, action: string): number {
    if (!this.available(licence)) {
      return 0;
    }
    const l = this.licences[licence];
    if (l && l['actions'] && l['actions'][action] !== undefined) {
      return l['actions'][action] ? 1 : 2;
    }
    return 0;
  }

  message(licence: string): string {
    if (!this.available(licence)) {
      return '';
    }
    if (!this.licences[licence].message) {
      return licence;
    }
    const lang = this.translate.currentLang;
    const l = this.licences[licence];
    return l.message[lang] || l.message['en'] || l.message['cs'] || licence;
  }

  label(licence: string): string {
    if (!this.available(licence)) {
      return '';
    }
    if (!this.licences[licence].label) {
      return licence;
    }
    const lang = this.translate.currentLang;
    const l = this.licences[licence];
    return l.label[lang] || l.label['en'] || l.label['cs'] || licence;
  }

  image(licence: string): string {
    if (!this.available(licence)) {
      return '';
    }
    if (!this.licences[licence].image) {
      return '';
    }
    return this.licences[licence].image
  }

  access(licence: string): string {
    if (!this.available(licence)) {
      return '';
    }
    if (!this.licences[licence].access) {
      return '';
    }
    return this.licences[licence].access
  }

  web(licence: string): string {
    if (!this.available(licence)) {
      return '';
    }
    if (!this.licences[licence].web) {
      return '';
    }
    const lang = this.translate.currentLang;
    const uuid = AppSettings.getUuidFromUrl();
    const path = encodeURIComponent(this.settings.getRelativePath());
    const target = encodeURIComponent(window.location.href)
    return this.licences[licence].web
      .replace(/\${LANG}/g, lang)
      .replace(/\${TARGET}/g, target)
      .replace(/\${PATH}/g, path)
      .replace(/\${UUID}/g, uuid);
  }

  labels(licences: string[]): string {
    return this.availableLicences(licences).map((licence: string) => this.label(licence)).join(", ");
  }
  
  bar(licence: string): boolean {
    if (!this.available(licence)) {
      return false
    }
    return !!this.licences[licence].bar;
  }

  watermark(licence: string): any {
    if (!this.available(licence)) {
      return false
    }
    return this.licences[licence].watermark;
  }
  
  available(licence: string): boolean {
    return !!this.licences && !!this.licences[licence];
  }

  on(): boolean {
    return !!this.licences;
  }

  anyUserLicence(): boolean {
    return !!this.userLicences && this.userLicences.length > 0;
  }

  availableLicences(licences: string[]): string[] {
    if (!licences) {
      return [];
    }
    let result = [];
    for (const licence of licences) {
      if (this.available(licence) && result.indexOf(licence) < 0) {
        result.push(licence);
      }
    }
    return result;
  }

  anyAvailableLicence(licences: string[]): boolean {
    return this.availableLicences(licences).length > 0;
  }
 
  accessible(licences: string[]): boolean {
    if (!this.anyUserLicence() || !this.anyAvailableLicence(licences)) {
      return false;
    }
    for (const licence of licences) {
      if (this.userLicences.indexOf(licence) >= 0) {
        return true;
      }
    }
    return false;
  }

  appliedLicence(licences: string[]): string {
    if (!this.anyUserLicence() || !this.anyAvailableLicence(licences)) {
      return null;
    }
    for (const licence of this.userLicences) {
      if (licences.indexOf(licence) >= 0) {
        return licence;
      }
    }
    // for (const licence of licences) {
    //   const idx = this.userLicences.indexOf(licence);
    //   if (idx >= 0) {
    //     return this.userLicences[idx];
    //   }
    // }
    return null;
  }

  buildLock(licences: string[]): any {
    if (!this.anyAvailableLicence(licences)) {
      return {
        icon: 'lock',
        class: 'app-lock-licence-locked',
        color: '#e06f26',
        access: 'inaccessible',
        tooltip: this.label('_private')
      };
    } 
    const licence = this.appliedLicence(licences)
    if (licence) {
      const l = this.licences[licence];
      // color: '#4CAF50',
      return {
        icon: this.accessIcon(l.access, true),
        class: 'app-lock-licence-open',
        color: '#1e6b22',
        access: l.access,
        tooltip: this.labels(licences)
      };
    } else {
      const l = this.licences[this.availableLicences(licences)[0]];
      return {
        icon: this.accessIcon(l.access, false),
        class: 'app-lock-licence-locked',
        color: '#e06f26',
        access: l.access || 'inaccessible',
        tooltip: this.labels(licences)
      };
    }
  }

  licencesByType(type: string): string[] {
    if (!this.licences) {
      return [];
    }
    let lArray = [];
    for (const l in this.licences) {
      if (!l.startsWith("_") && this.licences[l].access == type) {
        lArray.push(l);
      }
    }
    return lArray;
  }



  accessIcon(type: string, accessible: boolean): string {
    switch (type) {
      case 'open': return accessible ? 'visibility' : 'visibility_off';
      case 'login': return accessible ? 'key' : 'key_off';
      case 'terminal': return accessible ? 'account_balance' : 'account_balance';
      case 'inaccessible': return accessible ? 'lock_open' : 'lock';
      default: return accessible ? 'lock_open' : 'lock';
    }
  }



}

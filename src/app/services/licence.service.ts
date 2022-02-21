import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from './app-settings';


@Injectable()
export class LicenceService {

  userLicences: string[];
  licences: any;

  constructor(private translate: TranslateService, private settings: AppSettings) {
    this.assignLicences(this.settings.licences);
    this.settings.kramerius$.subscribe(() =>  {
      this.assignLicences(this.settings.licences);
    });
  }

  assignLicences(licences: any) {
    // console.log('assignLicences', licences);
      this.licences = licences;
  }

  assignUserLicences(licences: string[]) {
    this.userLicences = this.availableLicences(licences);
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


  buildLock(licences: string[]): any {
    if (!this.anyAvailableLicence(licences)) {
      return {
        icon: 'lock',
        class: 'app-lock-private',
        tooltip: this.label('_private')
      };
    } else if (this.accessible(licences)) {
      return {
        icon: 'no_photography',
        class: 'app-lock-licence-open',
        tooltip: this.labels(licences)
      };
    } else {
      return {
        icon: 'lock',
        class: 'app-lock-licence-locked',
        tooltip: this.labels(licences)
      };
    }
  }


}

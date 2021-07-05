import { Injectable } from '@angular/core';


@Injectable()
export class LicenceService {

  userLicences: string[];
  licences: any;

  constructor() {}

  assignLicences(licences: any) {
      this.licences = licences;
  }

  assignUserLicences(licences: string[]) {
    this.userLicences = licences;
}

  label(licence: string): string {
    if (!this.available(licence)) {
      return '';
    }
    return this.licences[licence].label || licence;
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


}

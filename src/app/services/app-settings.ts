import { Injectable } from '@angular/core';

declare var APP_GLOBAL: any;

@Injectable()

export class AppSettings {

  public multiKramerius: boolean;

  public title: string;
  public logo: string;
  public url: string;
  public code: string;
  public richCollections: boolean;
  public joinedDoctypes: boolean;
  public doctypes: string[];

  public share_url = APP_GLOBAL.share_url;
  public enablePeriodicalVolumesYearsLayout = APP_GLOBAL.enablePeriodicalVolumesYearsLayout;
  public enablePeriodicalIsssuesCalendarLayout = APP_GLOBAL.enablePeriodicalIsssuesCalendarLayout;
  public defaultPeriodicalVolumesLayout = APP_GLOBAL.defaultPeriodicalVolumesLayout;
  public defaultPeriodicalIsssuesLayout = APP_GLOBAL.defaultPeriodicalIssuesLayout;
  public krameriusList: KrameriusData[];

  constructor() {
    this.krameriusList = [];
    for (const k of APP_GLOBAL.krameriusList) {
      this.krameriusList.push(k);
    }
    this.multiKramerius = this.krameriusList.length > 1;
    this.assignKrameriusByIndex(0);
  }

  public assignKrameriusByCode(code: string) {
    const k = this.findCrameriusByCode(code);
    if (k) {
      this.assignKramerius(k);
    }
  }

  private findCrameriusByCode(code: string): KrameriusData {
    for (const k of this.krameriusList) {
      if (k.code === code) {
        return k;
      }
    }
  }

  public assignKrameriusByIndex(index: number) {
    const k = this.krameriusList[index];
    this.assignKramerius(k);
  }

  public assignKramerius(kramerius: KrameriusData) {
    this.code = kramerius.code;
    this.title = kramerius.title;
    this.url = kramerius.url;
    this.logo = kramerius.logo;
    this.richCollections = kramerius.richCollections;
    this.joinedDoctypes = kramerius.joinedDoctypes;
    this.doctypes = kramerius.doctypes;
  }

  public getLogoByCode(code: string): string {
    const k = this.findCrameriusByCode(code);
    if (k) {
      return k.logo;
    }
    return null;
  }

  public getUrlByCode(code: string): string {
    const k = this.findCrameriusByCode(code);
    if (k) {
      return k.url;
    }
    return null;
  }

  public getPathPrefix(): string {
    if (!this.multiKramerius) {
      return '';
    }
    return '/' + this.code;
  }
}


interface KrameriusData {
  code: string;
  title: string;
  logo: string;
  url: string;
  richCollections: boolean;
  joinedDoctypes: boolean;
  doctypes: string[];
}

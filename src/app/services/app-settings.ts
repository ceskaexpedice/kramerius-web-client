import { CollectionService } from './collection.service';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

declare var APP_GLOBAL: any;

@Injectable()
export class AppSettings {

  private listner = new Subject<KrameriusData>();
  kramerius$ = this.listner.asObservable();


  public multiKramerius: boolean;
  public currentCode: string;

  public title: string;
  public subtitle: string;
  public logo: string;
  public logoHome: string;
  public url: string;
  public schemaVersion: string;
  public solrVersion: string;
  public code: string;
  public richCollections: boolean;
  public joinedDoctypes: boolean;
  public doctypes: string[];
  public filters: string[];
  public lemmatization: boolean;
  public iiifEnabled: boolean;
  public k3: string;
  public customRightMessage: boolean;
  public dnntFilter: boolean;
  public originLink: boolean;
  public mapSearch: boolean;
  // public topLevelFilter: string;
  public hiddenLocks: boolean;

  public share_url = APP_GLOBAL.share_url;
  public enablePeriodicalVolumesYearsLayout = APP_GLOBAL.enablePeriodicalVolumesYearsLayout;
  public enablePeriodicalIsssuesCalendarLayout = APP_GLOBAL.enablePeriodicalIsssuesCalendarLayout;
  public defaultPeriodicalVolumesLayout = APP_GLOBAL.defaultPeriodicalVolumesLayout;
  public defaultPeriodicalIsssuesLayout = APP_GLOBAL.defaultPeriodicalIssuesLayout;
  public publicFilterDefault = APP_GLOBAL.publicFilterDefault;
  public dnnt = APP_GLOBAL.dnnt;
  public bigHomeLogo = APP_GLOBAL.bigHomeLogo;
  public hideHomeTitle = APP_GLOBAL.hideHomeTitle;
  public advancedSearch = APP_GLOBAL.advancedSearch;
  public aboutPage = APP_GLOBAL.aboutPage;
  public faqPage = APP_GLOBAL.faqPage;
  public footer = APP_GLOBAL.footer;
  public cloudEnabled = !!APP_GLOBAL.cloudEnabled;
  public landingPage = !!APP_GLOBAL.landingPage;

  public showMetadata = APP_GLOBAL.showMetadata || 'always';
  public showCitation = APP_GLOBAL.showCitation || 'always';
  public showSharing = APP_GLOBAL.showSharing || 'always';
  public showPdfGeneration = APP_GLOBAL.showPdfGeneration || 'always';
  public showPrintPreparation = APP_GLOBAL.showPrintPreparation || 'always';
  public showPageJpeg = APP_GLOBAL.showPageJpeg || 'always';
  public showPageOcr = APP_GLOBAL.showPageOcr || 'always';
  public showTextSelection = APP_GLOBAL.showTextSelection || 'always';
  public showImageCrop = APP_GLOBAL.showImageCrop || 'always';

  public newestAll = !!APP_GLOBAL.newestAll;
  public crossOrigin = !!APP_GLOBAL.crossOrigin;

  public krameriusList: KrameriusData[];
  public krameriusVsList = APP_GLOBAL.krameriusVsList;

  constructor(private collectionsService: CollectionService) {
    this.krameriusList = [];
    for (const k of APP_GLOBAL.krameriusList) {
      this.krameriusList.push(k);
    }
    this.multiKramerius = this.krameriusList.length > 1;
    this.assignKrameriusByIndex(0);
  }

  public assignKrameriusByCode(code: string): boolean {
    if (this.currentCode === code) {
      return true;
    }
    const k = this.findCrameriusByCode(code);
    if (k) {
      this.assignKramerius(k);
      return true;
    }
    return false;
  }

  public findCrameriusByCode(code: string): KrameriusData {
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
    this.collectionsService.clear();
    this.code = kramerius.code;
    this.title = kramerius.title;
    this.subtitle = kramerius.subtitle;
    this.url = kramerius.url;
    this.schemaVersion = kramerius.schemaVersion || '1.0';
    this.logo = kramerius.logo || 'assets/img/logo.png'
    this.logoHome = kramerius.logoHome || this.logo;
    this.richCollections = kramerius.richCollections;
    this.joinedDoctypes = kramerius.joinedDoctypes;
    this.doctypes = kramerius.doctypes;
    this.filters = kramerius.filters || [];
    this.lemmatization = kramerius.lemmatization;
    this.iiifEnabled = kramerius.iiif;
    this.k3 = kramerius.k3;
    this.dnntFilter = kramerius.dnntFilter;
    this.originLink = kramerius.originLink;
    this.customRightMessage = kramerius.customRightMessage;
    this.mapSearch = !!kramerius.mapSearch;
    this.hiddenLocks = !!kramerius.hiddenLocks;
    this.currentCode = this.code;
    this.listner.next(kramerius);
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

  public getRouteFor(path: string): string {
    return this.getPathPrefix() + '/' + path;
  }

  public availableFilter(filter: string): boolean {
    return this.filters.indexOf(filter) > -1;
  }

  public k5Compat(): boolean {
    return this.schemaVersion === '1.0';
  }


}


interface KrameriusData {
  code: string;
  title: string;
  subtitle: string;
  logo: string;
  logoHome: string;
  url: string;
  schemaVersion: string;
  richCollections: boolean;
  joinedDoctypes: boolean;
  doctypes: string[];
  filters: string[];
  lemmatization: boolean;
  iiif: boolean;
  k3: string;
  dnntFilter: boolean;
  originLink: boolean;
  customRightMessage: boolean;
  mapSearch: boolean;
  hiddenLocks: boolean;
  type: string;
}

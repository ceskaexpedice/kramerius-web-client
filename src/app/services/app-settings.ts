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
  public version: number;
  public code: string;
  public richCollections: boolean;
  public joinedDoctypes: boolean;
  public doctypes: string[];
  public filters: string[];
  public iiifEnabled: boolean;
  public k3: string;
  public customRightMessage: boolean;
  public ignorePolicyFlag: boolean;
  public originLink: boolean;
  public mapSearch: boolean;
  public mapSearchType: string;
  public mapSearchTypeDefault: string;
  public hiddenLocks: boolean;
  public legacyLocks: boolean;
  public licences: any;
  public containsLicences: boolean;
  public preselectedLicences: [string];

  public ga4 = APP_GLOBAL.ga4;
  public ga4clientId = APP_GLOBAL.ga4clientId;
  public matomo = APP_GLOBAL.matomo;
  public matomoSiteId = APP_GLOBAL.matomoSiteId;

  public maxOmnibusParts: number;
  public maxOmnibusPages: number;
  public adminClientUrl: string;
  public copyrightedText: string;

  public keycloak: boolean;
  public georef: boolean;
  public termsPage : [string, string];
  public termsPage2 : [string, string];
  public termsUrl: [string, string];
  public auth: any;
  public deployPath = APP_GLOBAL.deployPath || '';

  public share_url = APP_GLOBAL.share_url;
  public googleMapsApiKey = APP_GLOBAL.googleMapsApiKey;
  public enablePeriodicalVolumesYearsLayout = APP_GLOBAL.enablePeriodicalVolumesYearsLayout;
  public enablePeriodicalIsssuesCalendarLayout = APP_GLOBAL.enablePeriodicalIsssuesCalendarLayout;
  public defaultPeriodicalVolumesLayout = APP_GLOBAL.defaultPeriodicalVolumesLayout;
  public defaultPeriodicalIsssuesLayout = APP_GLOBAL.defaultPeriodicalIssuesLayout;
  public publicFilterDefault = APP_GLOBAL.publicFilterDefault;
  public bigHomeLogo = APP_GLOBAL.bigHomeLogo;
  public hideHomeTitle = APP_GLOBAL.hideHomeTitle;
  public advancedSearch = !!APP_GLOBAL.advancedSearch;
  public aboutPage : [string, string] = APP_GLOBAL.aboutPage;
  public faqPage : [string, string] = APP_GLOBAL.faqPage;
  public impressumPage : [string, string] = APP_GLOBAL.impressumPage;
  public footer : [string, string] = APP_GLOBAL.footer;
  public krameriusLogin = !!APP_GLOBAL.krameriusLogin;
  public landingPage = !!APP_GLOBAL.landingPage;
  public cookiebar = !!APP_GLOBAL.cookiebar;
  public navbarLogoOnHome = !!APP_GLOBAL.navbarLogoOnHome;


  public languages: string[] = APP_GLOBAL.languages || ['cs', 'en', 'de', 'sk'];

  public citationServiceUrl = APP_GLOBAL.citationServiceUrl || "https://citace.kramerius.cloud";

  public actions = {
    'pdf': AppSettings.action('pdf', 'always'), 
    'print': AppSettings.action('print', 'always'), 
    'jpeg': AppSettings.action('jpeg', 'always'), 
    'text': AppSettings.action('text', 'always'), 
    'metadata': AppSettings.action('metadata', 'always'), 
    'citation': AppSettings.action('citation', 'always'), 
    'share': AppSettings.action('share', 'always'), 
    'selection': AppSettings.action('selection', 'always'), 
    'crop': AppSettings.action('crop', 'always')
  }

  public newestAll = !!APP_GLOBAL.newestAll;
  public crossOrigin = !!APP_GLOBAL.crossOrigin;

  public krameriusList: KrameriusData[];
  public krameriusVsList = APP_GLOBAL.krameriusVsList;

  constructor() {
    this.krameriusList = [];
    for (const k of APP_GLOBAL.krameriusList) {
      this.krameriusList.push(k);
    }
    this.multiKramerius = this.krameriusList.length > 1;
    if (!this.multiKramerius) {
      this.assignKrameriusByIndex(0);
    }
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
    this.code = kramerius.code;
    this.title = kramerius.title;
    this.subtitle = kramerius.subtitle;
    this.url = kramerius.url;
    this.version = kramerius.version || 5;
    this.logo = kramerius.logo || 'assets/img/logo.png'
    this.logoHome = kramerius.logoHome || this.logo;
    this.richCollections = kramerius.richCollections;
    this.joinedDoctypes = kramerius.joinedDoctypes;
    this.doctypes = kramerius.doctypes;
    this.filters = kramerius.filters || [];
    this.iiifEnabled = kramerius.iiif;
    this.k3 = kramerius.k3;
    this.originLink = kramerius.originLink;
    this.customRightMessage = kramerius.customRightMessage;
    this.ignorePolicyFlag = !!kramerius.ignorePolicyFlag;
    this.mapSearch = !!kramerius.mapSearch;
    this.mapSearchType = kramerius.mapSearchType || 'maps';
    this.mapSearchTypeDefault = kramerius.mapSearchTypeDefault || (this.mapSearchType == 'markers' ? 'markers' : 'maps');
    this.licences = kramerius.licences;
    this.containsLicences = !!kramerius.containsLicences;
    this.preselectedLicences = kramerius.preselectedLicences;
    this.hiddenLocks = !!kramerius.hiddenLocks;
    this.legacyLocks = !!kramerius.legacyLocks;
    this.maxOmnibusPages = kramerius.maxOmnibusPages || 0;
    this.maxOmnibusParts = kramerius.maxOmnibusParts || 0;
    this.adminClientUrl = kramerius.adminClientUrl;
    this.copyrightedText = kramerius.copyrightedText;
    this.keycloak = !!kramerius.keycloak;
    this.georef = !!kramerius.georef;
    this.termsPage = kramerius.termsPage;
    this.termsPage2 = kramerius.termsPage2;
    this.termsUrl = kramerius.termsUrl;
    this.auth = kramerius.auth;
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


  public getRelativePath(): string {
    let path = window.location.pathname + window.location.search;
    if (path.startsWith('/')) {
      path = path.substring(1);  
    }
    path = path.substring(this.deployPath.length);
    if (path.startsWith('/')) {
      path = path.substring(1);  
    }
    if (this.multiKramerius) {
      path = path.substring(this.code.length);
    }
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    return path;
  }

  static getUuidFromUrl(): string {
    const path = location.pathname;
    const query = location.search;
    let uuid = "";
    if (path.indexOf('uuid:') > -1) {
      uuid = path.substr(path.indexOf('uuid:'));
    }
    if (query.indexOf('article=uuid:') > -1) {
      uuid = AppSettings.parseUuid(query, 'article');
    }
    if (query.indexOf('page=uuid:') > -1) {
      uuid = AppSettings.parseUuid(query, 'page');
    }
    return uuid;
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
    return this.filters && this.filters.indexOf(filter) > -1;
  }

  public availableDoctype(doctype: string): boolean {
    return this.doctypes && this.doctypes.indexOf(doctype) > -1;
  }

  public k5Compat(): boolean {
    return this.version == 5;
  }

  getToken() {
    return localStorage.getItem('auth.token.' + this.code);
  }

  setToken(token: string) {
    return localStorage.setItem('auth.token.' + this.code, token);
  }

  removeToken() {
    return localStorage.removeItem('auth.token.' + this.code);
  }

  private static action(action: string, defaultValue: string): string {
    if (!APP_GLOBAL.actions) {
      return defaultValue;
    }
    return APP_GLOBAL.actions[action] || defaultValue;
  }

  private static parseUuid(query: string, param: string) {
    for (const p of query.split('&')) {
      if (p.indexOf(param + '=') > -1) {
        return p.substring(p.indexOf(param + '=') + param.length + 1);
      }
    }
  }

}

interface KrameriusData {
  code: string;
  title: string;
  subtitle: string;
  logo: string;
  logoHome: string;
  url: string;
  version: number;
  richCollections: boolean;
  joinedDoctypes: boolean;
  doctypes: string[];
  filters: string[];
  iiif: boolean;
  k3: string;
  licences: any;
  originLink: boolean;
  customRightMessage: boolean;
  ignorePolicyFlag: boolean;
  mapSearch: boolean;
  mapSearchType: string;
  mapSearchTypeDefault: string;
  hiddenLocks: boolean;
  legacyLocks: boolean;
  type: string;
  maxOmnibusParts: number;
  maxOmnibusPages: number;
  keycloak: boolean;
  georef: boolean;
  termsPage: [string, string];
  termsPage2: [string, string];
  termsUrl: [string, string];
  auth: any;
  adminClientUrl: string;
  containsLicences: boolean;
  preselectedLicences: [string];
  copyrightedText: string;
}

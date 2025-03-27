import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

declare var APP_GLOBAL: any;

@Injectable()
export class AppSettings {

  private listner = new Subject<KrameriusData>();
  kramerius$ = this.listner.asObservable();

  public multiKramerius: boolean;
  public currentCode: string;

  public title: string;
  public titles: any;
  public subtitle: string;
  public subtitles: any;
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
  public folders: boolean;
  public curatorListsEnabled: boolean;
  public curatorLists: any[];
  public curatorListsCardsVertical: boolean;
  public curatorKeywordsEnabled: boolean;
  public curatorKeywords: any[];
  public similaritySearchIndex: string;
  public makarius: boolean;
  public hiddenLocks: boolean;
  public legacyLocks: boolean;
  public licences: any;
  public containsLicences: boolean;
  public preselectedLicences: [string];

  public ga4 = APP_GLOBAL.ga4;
  public ga4clientId = APP_GLOBAL.ga4clientId;
  public clientId = APP_GLOBAL.clientId;
  public matomo = APP_GLOBAL.matomo;
  public matomoSiteId = APP_GLOBAL.matomoSiteId;

  public maxOmnibusParts: number;
  public maxOmnibusPages: number;
  public adminClientUrl: string;
  public copyrightedText: string;
  public replaceImageUrl: string;

  public ai: boolean;
  public keycloak: boolean;
  public georef: boolean;
  public termsPage : [string, string];
  public termsPage2 : [string, string];
  public termsUrl: [string, string];
  public auth: any;
  public deployPath = APP_GLOBAL.deployPath || '';
  public forceAiTokenFrom = APP_GLOBAL.forceAiTokenFrom;
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

  public formBanner = !!APP_GLOBAL.formBanner;

  public defaultLanguage: string = APP_GLOBAL.defaultLanguage || 'cs';
  public docsNav = !!APP_GLOBAL.docsNav;
  public languages: string[] = APP_GLOBAL.languages || ['cs', 'en', 'de', 'sk', 'sl'];

  public citationServiceUrl = APP_GLOBAL.citationServiceUrl || "https://citace.kramerius.cloud";
  public citationService = APP_GLOBAL.citationService || "https://citace.ceskadigitalniknihovna.cz";
  public citationServiceType = APP_GLOBAL.citationServiceType || "old";
  public textModeEnabled = !!APP_GLOBAL.textModeEnabled;
  public maxIiifImageSize = APP_GLOBAL.maxIiifImageSize || 7000;


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

  constructor(public translate: TranslateService) {
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


  public getTitle() {
    if (this.titles) {
      return this.titles[this.translate.currentLang] || this.titles[this.defaultLanguage];
    } else {
      return this.title;
    }
  }

  public getTitleForKramerius(kramerius: KrameriusData) {
    if (kramerius.titles) {
      return kramerius.titles[this.translate.currentLang] || kramerius.titles[this.defaultLanguage];
    } else {
      return kramerius.title;
    }
  }
  public getTitleForAnalytics(kramerius: KrameriusData) {
    if (kramerius.title) {
      return kramerius.title;
    } else if (kramerius.titles) {
      return kramerius.titles[0];
    }
  }

  public getSubtitle() {
    if (this.subtitles) {
      return this.subtitles[this.translate.currentLang] || this.subtitles[this.defaultLanguage];
    } else {
      return this.subtitle;
    }
  }

  public assignKramerius(kramerius: KrameriusData) {
    this.code = kramerius.code;
    this.title = kramerius.title;
    this.titles = kramerius.titles;
    this.subtitle = kramerius.subtitle;
    this.subtitles = kramerius.subtitles;
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
    this.folders = !!kramerius.folders;
    this.curatorListsEnabled = !!kramerius.curatorLists;
    this.curatorLists = kramerius.curatorLists || [];
    this.curatorListsCardsVertical = !!kramerius.curatorListsCardsVertical;
    this.curatorKeywordsEnabled = !!kramerius.curatorKeywords;
    this.curatorKeywords = kramerius.curatorKeywords || [];
    this.similaritySearchIndex = kramerius.similaritySearchIndex;
    this.makarius = !!kramerius.makarius;
    this.licences = kramerius.licences;
    this.containsLicences = !!kramerius.containsLicences;
    this.preselectedLicences = kramerius.preselectedLicences;
    this.hiddenLocks = !!kramerius.hiddenLocks;
    this.legacyLocks = !!kramerius.legacyLocks;
    this.maxOmnibusPages = kramerius.maxOmnibusPages || 0;
    this.maxOmnibusParts = kramerius.maxOmnibusParts || 0;
    this.adminClientUrl = kramerius.adminClientUrl;
    this.replaceImageUrl = kramerius.replaceImageUrl;
    this.copyrightedText = kramerius.copyrightedText;
    this.keycloak = !!kramerius.keycloak;
    this.ai = !!kramerius.ai;
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

  getAiToken() {
    if (this.forceAiTokenFrom) {
      return localStorage.getItem('auth.token.' + this.forceAiTokenFrom);
    }
  }

  getClientId() {
    if (this.version < 7) {
      return null;
    }
    return this.clientId || this.ga4clientId;
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
  titles: any;
  subtitle: string;
  subtitles: any;
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
  folders: boolean;
  curatorListsEnabled: boolean;
  curatorLists: any[];
  curatorListsCardsVertical: boolean;
  curatorKeywordsEnabled: boolean;
  curatorKeywords: any[];
  hiddenLocks: boolean;
  legacyLocks: boolean;
  type: string;
  maxOmnibusParts: number;
  maxOmnibusPages: number;
  keycloak: boolean;
  ai: boolean;
  georef: boolean;
  termsPage: [string, string];
  termsPage2: [string, string];
  termsUrl: [string, string];
  auth: any;
  adminClientUrl: string;
  replaceImageUrl: string;
  containsLicences: boolean;
  makarius: boolean;
  preselectedLicences: [string];
  copyrightedText: string;
  similaritySearchIndex: string;
}

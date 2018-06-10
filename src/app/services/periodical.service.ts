import { AppSettings } from './app-settings';
import { PeriodicalQuery } from './../periodical/periodical_query.model';
import { Router } from '@angular/router';
import { PeriodicalFtItem } from './../model/periodicalftItem.model';
import { KrameriusApiService } from './kramerius-api.service';
import { LocalStorageService } from './local-storage.service';
import { ModsParserService } from './mods-parser.service';
import { SolrService } from './solr.service';
import { DocumentItem } from './../model/document_item.model';
import { PeriodicalItem } from './../model/periodicalItem.model';
import { Injectable } from '@angular/core';
import { Metadata } from '../model/metadata.model';

@Injectable()
export class PeriodicalService {

  query: PeriodicalQuery;
  items: PeriodicalItem[];

  yearItems: PeriodicalItem[];
  minYear: number;
  maxYear: number;
  metadata: Metadata;
  document: DocumentItem;
  state: PeriodicalState;
  yearsLayoutEnabled: boolean;
  gridLayoutEnabled: boolean;
  calendarLayoutEnabled: boolean;
  activeLayout: string;
  dates: Date[];
  daysOfMonths: any[];
  daysOfMonthsItems: any[];
  activeMobilePanel: string;
  fulltext: PeriodicalFulltext;
  volumeDetail;
  volumesReverseOrder: boolean;
  issuesReverseOrder: boolean;

  orderingType = 'none'; // none | periodical | fulltext

  constructor(private solrService: SolrService,
    private router: Router,
    private appSettings: AppSettings,
    private modsParserService: ModsParserService,
    private localStorageService: LocalStorageService,
    private krameriusApiService: KrameriusApiService) {
  }

  init(query: PeriodicalQuery) {
    this.clear();
    this.query = query;
    this.state = PeriodicalState.Loading;
    this.krameriusApiService.getItem(query.uuid).subscribe((item: DocumentItem) => {
      this.document = item;
      this.krameriusApiService.getMods(this.document.root_uuid).subscribe(response => {
        this.metadata = this.modsParserService.parse(response, this.document.root_uuid);
        this.metadata.model = item.doctype;
        if (this.isMonograph()) {
          this.metadata.doctype = 'monographbundle';
          this.metadata.addMods('monographbundle', response);
          this.localStorageService.addToVisited(this.document, this.metadata);
          if (query.fulltext) {
            this.initFulltext();
          } else {
            this.krameriusApiService.getMonographUnits(query.uuid, query).subscribe(units => {
              this.assignItems(this.solrService.periodicalItems(units, 'monographunit'));
              this.initMonographUnit();
            });
          }
        } else if (this.isPeriodical()) {
          this.metadata.doctype = 'periodical';
          this.metadata.addMods('periodical', response);
          this.localStorageService.addToVisited(this.document, this.metadata);
          if (query.fulltext) {
            this.initFulltext();
          } else {
            this.krameriusApiService.getPeriodicalVolumes(query.uuid, query).subscribe(volumes => {
              this.assignItems(this.solrService.periodicalItems(volumes, 'periodicalvolume'));
              this.initPeriodical();
            });
          }
        } else if (this.isPeriodicalVolume()) {
          this.metadata.doctype = 'periodical';
          this.metadata.addMods('periodical', response);
          this.metadata.assignVolume(this.document);
          this.krameriusApiService.getPeriodicalVolumes(this.document.root_uuid, query).subscribe(volumes => {
            this.assignVolumeDetails(this.solrService.periodicalItems(volumes, 'periodicalvolume'));
          });
          this.krameriusApiService.getMods(query.uuid).subscribe(mods => {
            const metadata = this.modsParserService.parse(mods, query.uuid, 'volume');
            this.metadata.addMods('periodicalvolume', mods);
            this.metadata.volumeMetadata = metadata;
          });
          if (query.fulltext) {
            this.initFulltext();
          } else {
            this.krameriusApiService.getPeriodicalIssues(this.document.root_uuid, query.uuid, query).subscribe(issues => {
              this.assignItems(this.solrService.periodicalItems(issues, 'periodicalitem', query.uuid));
              this.initPeriodicalVolume();
            });
          }
        }
      });
    });
  }


  getNumberOfResults(): number {
    if (this.fulltext) {
      return this.fulltext.results;
    } else if (this.items) {
      return this.items.length;
    }
  }


  changeActiveLayout(layout: string) {
    if (this.isPeriodical()) {
      this.localStorageService.setProperty(LocalStorageService.PERIODICAL_VOLUMES_LAYOUT, layout);
    } else if (this.isPeriodicalVolume()) {
      this.localStorageService.setProperty(LocalStorageService.PERIODICAL_ISSUES_LAYOUT, layout);
    }
    this.activeLayout = layout;
  }


  setReverseOrder(enabled: boolean) {
    if (this.fulltext || !this.items || this.items.length < 1) {
      return;
    }
    if (this.isPeriodical() && this.volumesReverseOrder !== enabled) {
      this.localStorageService.setProperty(LocalStorageService.PERIODICAL_VOLUMES_REVERSE_ORDER, enabled ? 'true' : 'false');
      this.volumesReverseOrder = enabled;
    } else if (this.isPeriodicalVolume() && this.issuesReverseOrder !== enabled) {
      this.localStorageService.setProperty(LocalStorageService.PERIODICAL_ISSUES_REVERSE_ORDER, enabled ? 'true' : 'false');
      this.issuesReverseOrder = enabled;
    } else {
      return;
    }
    const container = document.getElementById('app-periodical-grid-container');
    this.reverseItems();
    container.scrollTop = 1;
    container.scrollTop = 0;
  }

  private reverseItems() {
    this.items.reverse();
  }

  clear() {
    this.state = PeriodicalState.None;
    this.query = null;
    this.minYear = null;
    this.maxYear = null;
    this.yearsLayoutEnabled = false;
    this.gridLayoutEnabled = false;
    this.calendarLayoutEnabled = false;
    this.activeLayout = null;
    this.metadata = null;
    this.document = null;
    this.yearItems = null;
    this.items = null;
    this.volumeDetail = null;
    this.fulltext = null;
    this.dates = [];
    this.daysOfMonths = [];
    this.daysOfMonthsItems = [];
    this.activeMobilePanel = 'content';
    this.orderingType = 'none';
    this.volumesReverseOrder = this.localStorageService.getProperty(LocalStorageService.PERIODICAL_VOLUMES_REVERSE_ORDER) === 'true';
    this.issuesReverseOrder = this.localStorageService.getProperty(LocalStorageService.PERIODICAL_ISSUES_REVERSE_ORDER) === 'true';
  }

  isPeriodicalVolume(): boolean {
    return this.document && this.document.doctype === 'periodicalvolume';
  }

  isPeriodical(): boolean {
    return this.document && this.document.doctype === 'periodical';
  }

  isMonograph(): boolean {
    return this.document && this.document.doctype === 'monograph';
  }

  isStateSuccess(): boolean {
    return this.state === PeriodicalState.Success;
  }

  isStateFailure(): boolean {
    return this.state === PeriodicalState.Failure;
  }

  isStateLoading(): boolean {
    return this.state === PeriodicalState.Loading;
  }


  private assignVolumeDetails(volumes: PeriodicalItem[]) {
    if (!volumes || volumes.length < 1) {
      return;
    }
    let index = -1;
    for (let i = 0; i < volumes.length; i++) {
      if (volumes[i].uuid === this.document.uuid) {
        index = i;
        break;
      }
    }
    if (index < 0) {
      return;
    }
    this.volumeDetail = {};
    this.volumeDetail['current'] = volumes[index];
    if (index > 0) {
      this.volumeDetail['previous'] = volumes[index - 1];
    }
    if (index < volumes.length - 1) {
      this.volumeDetail['next'] = volumes[index + 1];
    }
  }

  private assignItems(items: PeriodicalItem[]) {
    this.items = items;
    if (this.isPeriodical()) {
      this.orderingType = 'periodical';
      if (this.volumesReverseOrder) {
        this.reverseItems();
      }
    } else if (this.isPeriodicalVolume()) {
      this.orderingType = 'periodical';
      if (this.issuesReverseOrder) {
        this.reverseItems();
      }
    } else {
      this.orderingType = 'none';
    }
    for (const item of this.items) {
      item.thumb = this.krameriusApiService.getThumbUrl(item.uuid);
    }
  }

  private initPeriodicalVolume() {
    this.yearsLayoutEnabled = false;
    this.gridLayoutEnabled = true;
    const year = this.document.volumeYear;
    const prefLayout = this.localStorageService.getProperty(LocalStorageService.PERIODICAL_ISSUES_LAYOUT);
    this.activeLayout = prefLayout ? prefLayout : this.appSettings.defaultPeriodicalIsssuesLayout;
    if (this.appSettings.enablePeriodicalIsssuesCalendarLayout && year && !isNaN(year as any)) {
      this.calendarLayoutEnabled = true;
      if (!this.calcCalender(year)) {
        this.activeLayout = 'grid';
      }
    } else {
      this.activeLayout = 'grid';
      this.calendarLayoutEnabled = false;
    }
    this.state = PeriodicalState.Success;
  }


  private initFulltext() {
    this.fulltext = new PeriodicalFulltext();
    this.fulltext.limit = 40;
    this.fulltext.query = this.query.fulltext;
    this.fulltext.page = this.query.page || 1;
    if (this.isMonograph()) {
      this.orderingType = 'none';
    } else {
      this.orderingType = 'fulltext';
      this.fulltext.ordering = this.query.ordering;
    }
    const uuid1 = this.isPeriodicalVolume() ? this.document.root_uuid : this.query.uuid;
    const uuid2 = this.isPeriodicalVolume() ? this.query.uuid : null;
    this.krameriusApiService.getPeriodicalFulltextPages(uuid1, uuid2, this.fulltext.getOffset(), this.fulltext.limit, this.query).subscribe(response => {
      this.fulltext.pages = this.solrService.periodicalFtItems(response, this.fulltext.query);
      this.fulltext.results = this.solrService.numberOfResults(response);
      const issuePids = [];
      const volumePids = [];
      for (const item of this.fulltext.pages) {
        item.thumb = this.krameriusApiService.getThumbUrl(item.uuid);
        if (issuePids.indexOf(item.issueUuid) < 0) {
          issuePids.push(item.issueUuid);
        }
        if (volumePids.indexOf(item.volumeUuid) < 0) {
          volumePids.push(item.volumeUuid);
        }
      }
      this.krameriusApiService.getPeriodicalItemDetails(issuePids).subscribe(items => {
        for (const item of items['response']['docs']) {
          const detail = this.solrService.periodicalItem(item);
          for (const page of this.fulltext.pages) {
            if (this.isMonograph()) {
              page.isMonographUnit = true;
            }
            if (detail.uuid === page.issueUuid) {
              if (this.isMonograph()) {
                page.title = detail.title;
                page.part = detail.subtitle;
              } else {
                page.date = detail.title;
                page.issue = detail.subtitle;
              }
            } else if (detail.uuid === page.volumeUuid) {
              page.year = detail.title;
              page.volume = detail.subtitle;
            }
          }
        }
      });

      if (!this.isMonograph()) {
        this.krameriusApiService.getPeriodicalItemDetails(volumePids).subscribe(items => {
          for (const item of items['response']['docs']) {
            const detail = this.solrService.periodicalItem(item);
            for (const page of this.fulltext.pages) {
              if (detail.uuid === page.issueUuid) {
                page.date = detail.title;
                page.issue = detail.subtitle;
              } else if (detail.uuid === page.volumeUuid) {
                page.year = detail.title;
                page.volume = detail.subtitle;
              }
            }
          }
        });
      }
      this.state = PeriodicalState.Success;
    });
  }

  public getUrlParams() {
    if (this.query) {
      return this.query.toUrlParams(false);
    }
  }

  public setYearRange(from: number, to: number) {
    this.query.setYearRange(from, to);
    this.reload();
  }

  public reload() {
    this.router.navigate(['periodical', this.query.uuid],  { queryParams: this.query.toUrlParams(true) });
  }

  public changeSearchQuery(query: string) {
    this.query.setFulltext(query);
    this.reload();
  }

  public setFtPage(page: number) {
    this.query.setPage(page);
    this.reload();
  }

  public setAccessibility(accessibility: string) {
    this.query.setAccessibility(accessibility);
    this.reload();
  }

  public setOrdering(ordering: string) {
    this.query.setOrdering(ordering);
    this.reload();
  }


  public nextFtPage() {
    this.setFtPage(this.fulltext.page + 1);
  }

  public previousFtPage() {
    this.setFtPage(this.fulltext.page - 1);
  }

  public getFulltextQuery() {
    return this.fulltext ? this.fulltext.query : null;
  }

  private initMonographUnit() {
    this.gridLayoutEnabled = true;
    this.calendarLayoutEnabled = false;
    this.yearsLayoutEnabled = false;
    this.activeLayout = 'grid';
    this.state = PeriodicalState.Success;
  }



  private initPeriodical() {
    const range = this.metadata.getYearRange();
    if (range && range.length === 2) {
      this.minYear = range[0];
      this.maxYear = range[1];
      if (this.query.isYearRangeSet()) {
        if (this.minYear < this.query.from) {
          this.minYear = this.query.from;
        }
        if (this.maxYear > this.query.to) {
          this.maxYear = this.query.to;
        }
      }
    }
    this.gridLayoutEnabled = true;
    this.calendarLayoutEnabled = false;
    if (!this.appSettings.enablePeriodicalVolumesYearsLayout) {
      this.yearsLayoutEnabled = false;
      this.activeLayout = 'grid';
      this.state = PeriodicalState.Success;
      return;
    }
    for (const item of this.items) {
      if (item.title && !isNaN(item.title as any)) {
        const year = parseInt(item.title, 10);
        if (!this.maxYear || year > this.maxYear) {
          this.maxYear = year;
        }
        if (!this.minYear || year < this.minYear) {
          this.minYear = year;
        }
      } else {
        this.yearsLayoutEnabled = false;
        this.activeLayout = 'grid';
        this.state = PeriodicalState.Success;
        return;
      }
    }
    this.yearsLayoutEnabled = true;
    const prefLayout = this.localStorageService.getProperty(LocalStorageService.PERIODICAL_VOLUMES_LAYOUT);
    this.activeLayout = prefLayout ? prefLayout : this.appSettings.defaultPeriodicalVolumesLayout;
    this.calcYearItems();
    this.state = PeriodicalState.Success;
  }

  private calcYearItems() {
    // if ((this.maxYear - this.minYear + 1) > this.items.length) {
    this.yearItems = [];
    if (this.query.accessibility === 'all') {
      for (let i = this.minYear; i <= this.maxYear; i++) {
        let item: PeriodicalItem;
        for (let j = 0; j < this.items.length; j++) {
          if (this.items[j].title === String(i)) {
            item = this.items[j];
            break;
          }
        }
        if (!item) {
          item = new PeriodicalItem();
          item.title = String(i);
          item.doctype = 'periodicalvolume';
        }
        this.yearItems.push(item);
      }
    } else {
      this.yearItems = this.items;
    }
    // } else {
    //   this.yearItems = this.items;
    // }
  }

  private calcCalender(year): boolean {
    let issuesWithoutDate = 0;
    for (let i = 0; i < 12; i++) {
      this.daysOfMonths[i] = [];
      this.daysOfMonthsItems[i] = {};
    }
    for (const item of this.items) {
      let c = null;
      if (item.title) {
        c = item.title.split('.');
      }
      let ok = false;
      if (c && c.length === 3) {
        const d = c[0] + '';
        const m = c[1];
        let month = parseInt(m, 0);
        if (!isNaN(month) && month > 0 && month <= 12) {
          month -= 1;
          const day = parseInt(d, 0);
          if (!isNaN(day)) {
            this.daysOfMonths[month].push(day);
            ok = true;
            if (!this.daysOfMonthsItems[month][day]) {
              this.daysOfMonthsItems[month][day] = item.uuid;
            }
          }
        }
      }
      if (!ok) {
        issuesWithoutDate++;
      }
    }
    for (const m of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
      const date = new Date();
      date.setDate(3);
      date.setMonth(m);
      date.setFullYear(year);
      this.dates.push(date);
    }
    return issuesWithoutDate === 0;
  }



}


export enum PeriodicalState {
  Success, Loading, Failure, None
}

export class PeriodicalFulltext {
  query: string;
  results: number;
  page: number;
  limit: number;
  ordering: string;
  next: string;
  previous: string;
  pages: PeriodicalFtItem[];


  getOffset(): number {
    return this.limit * (this.page - 1);
  }

  private getResultIndexFrom(): number {
    return Math.min(this.results, this.getOffset() + 1);
  }


  private getResultIndexTo(): number {
    return Math.min(this.results, this.getOffset() + (this.pages ? this.pages.length : 0));
  }


  public getResultsRange(): string {
    const from = this.getResultIndexFrom();
    const to = this.getResultIndexTo();
    if (isNaN(from) || isNaN(to)) {
      return '-';
    } else if (to === 0) {
      return '0';
    } else {
      return from + ' - ' + to;
    }
  }

}

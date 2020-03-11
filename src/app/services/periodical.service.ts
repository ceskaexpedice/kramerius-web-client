import { Utils } from './utils.service';
import { AppSettings } from './app-settings';
import { PeriodicalQuery } from './../periodical/periodical_query.model';
import { Router } from '@angular/router';
import { PeriodicalFtItem } from './../model/periodicalftItem.model';
import { KrameriusApiService } from './kramerius-api.service';
import { LocalStorageService } from './local-storage.service';
import { DocumentItem } from './../model/document_item.model';
import { PeriodicalItem } from './../model/periodicalItem.model';
import { Injectable } from '@angular/core';
import { Metadata } from '../model/metadata.model';
import { PageTitleService } from './page-title.service';
import { NotFoundError } from '../common/errors/not-found-error';
import { HistoryService } from './history.service';
import { AnalyticsService } from './analytics.service';

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

  constructor(
    private utilsService: Utils,
    private router: Router,
    private settings: AppSettings,
    private history: HistoryService,
    private pageTitle: PageTitleService,
    private analytics: AnalyticsService,
    private localStorageService: LocalStorageService,
    private api: KrameriusApiService) {
  }

  init(query: PeriodicalQuery) {
    this.clear();
    this.query = query;
    this.state = PeriodicalState.Loading;
    this.api.getItem(query.uuid).subscribe((item: DocumentItem) => {
      this.document = item;
      this.api.getMetadata(this.document.root_uuid).subscribe((metadata: Metadata) => {
        this.metadata = metadata;
        this.pageTitle.setTitle(null, this.metadata.getShortTitle());
        this.metadata.assignDocument(this.document);
        if (this.isMonograph()) {
          this.metadata.doctype = 'monographbundle';
          this.metadata.addToContext('monographbundle', query.uuid);
          this.localStorageService.addToVisited(this.document, this.metadata);
          if (query.fulltext) {
            this.initFulltext();
          } else {
            if (this.settings.oldSchema()) {
              this.api.getChildren(query.uuid).subscribe(children => {
                this.assignItems(this.utilsService.parseMonographBundleChildren(children, query.accessibility));
                this.initMonographUnit();
              });
            } else {
              this.api.getMonographUnits(query.uuid, query).subscribe((units: PeriodicalItem[]) => {
                this.assignItems(units);
                this.initMonographUnit();
              });
            }
          }
        } else if (this.isPeriodical()) {
          this.metadata.doctype = 'periodical';
          this.metadata.addToContext('periodical', query.uuid);
          this.localStorageService.addToVisited(this.document, this.metadata);
          if (query.fulltext) {
            this.initFulltext();
          } else {
            this.api.getPeriodicalVolumes(query.uuid, query).subscribe((volumes: PeriodicalItem[]) => {
              this.assignItems(volumes);
              this.initPeriodical();
            });
          }
        } else if (this.isPeriodicalVolume()) {
          this.metadata.doctype = 'periodical';
          this.metadata.addToContext('periodical', this.document.root_uuid);
          this.metadata.assignVolume(this.document);
          this.pageTitle.setTitle(null, this.metadata.getShortTitlwWithVolume());
          this.api.getPeriodicalVolumes(this.document.root_uuid, query).subscribe((volumes: PeriodicalItem[]) => {
            this.assignVolumeDetails(volumes);
          });
          this.api.getMetadata(query.uuid, 'volume').subscribe((metadata: Metadata) => {
            if (this.metadata) {
              this.metadata.addToContext('periodicalvolume', query.uuid);
              this.metadata.volumeMetadata = metadata;
            }
          });
          if (query.fulltext) {
            this.initFulltext();
          } else {
            this.api.getPeriodicalIssues(query.uuid, query).subscribe((issues: PeriodicalItem[]) => {
              this.assignItems(issues);
              this.initPeriodicalVolume();
            });
          }
        }
      });
    },
      error => {
        if (error instanceof NotFoundError) {
          this.router.navigateByUrl(this.settings.getRouteFor('404'), { skipLocationChange: true });
        }
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

  getType(): string {
    if (!this.document) {
      return 'none';
    }
    return this.document.doctype;
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
    if (this.items.length === 1 && this.isPeriodicalVolume()) {
      const item = this.items[0];
      this.history.removeCurrentCheck(this.router.url);
      const uuid = item.virtual ? this.document.uuid : item.uuid;
      this.router.navigate(['/view', uuid], { replaceUrl: true });
      return;
    }
    for (const item of this.items) {
      item.thumb = this.api.getThumbUrl(item.uuid);
    }
  }

  private initPeriodicalVolume() {
    this.yearsLayoutEnabled = false;
    this.gridLayoutEnabled = true;
    const year = this.document.volumeYear;
    const prefLayout = this.localStorageService.getProperty(LocalStorageService.PERIODICAL_ISSUES_LAYOUT);
    this.activeLayout = prefLayout ? prefLayout : this.settings.defaultPeriodicalIsssuesLayout;
    if (this.settings.enablePeriodicalIsssuesCalendarLayout && year && !isNaN(year as any)) {
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
    this.api.getPeriodicalFulltext(uuid1, uuid2, this.fulltext.getOffset(), this.fulltext.limit, this.query).subscribe(([pages, results]: [PeriodicalFtItem[], number]) => {
      this.fulltext.pages = pages;
      this.fulltext.results = results;
      const issuePids = [];
      const volumePids = [];
      const unitPids = [];
      for (const item of this.fulltext.pages) {
        item.thumb = this.api.getThumbUrl(item.uuid);
        if (item.type === 'monograph_unit') {
          continue;
        }
        const unit = item.context['monographunit'];
        if (unitPids && unitPids.indexOf(unit) < 0) {
          unitPids.push(unit);
        }
        const issue = item.context['periodicalitem'];
        if (issue && issuePids.indexOf(issue) < 0) {
          issuePids.push(issue);
        }
        const supplement = item.context['supplement'];
        if (supplement && issuePids.indexOf(supplement) < 0) {
          issuePids.push(supplement);
        }
        const volume = item.context['periodicalvolume'];
        if (volume && volumePids.indexOf(volume) < 0) {
          volumePids.push(volume);
        }
      }
      if (this.isMonograph()) {
        this.api.getPeriodicalItemsDetails(unitPids).subscribe((items: PeriodicalItem[]) => {
          for (const item of items) {
            for (const page of this.fulltext.pages) {
              page.type = 'monograph_unit_page';
              if (item.uuid === page.context['monographunit']) {
                page.title = item.name;
                page.part = item.number;
              }
            }
          }
        });
      } else {
        this.api.getPeriodicalItemsDetails(volumePids).subscribe((items: PeriodicalItem[]) => {
          console.log('asaf', items);
          for (const item of items) {
            for (const page of this.fulltext.pages) {
              if (item.uuid === page.context['periodicalvolume']) {
                page.year = item.date;
                page.volume = item.number;
              }
            }
          }
        });
        this.api.getPeriodicalItemsDetails(issuePids).subscribe((items: PeriodicalItem[]) => {
          for (const item of items) {
            for (const page of this.fulltext.pages) {
              if (item.uuid === page.context['periodicalitem']) {
                page.date = item.date;
                page.issue = item.number;
              } else if (item.uuid === page.context['supplement']) {
                page.date = item.date;
                page.supplement = item.number;
              }
            }
          }
        });
      }
      this.state = PeriodicalState.Success;
    });
  }






  // private initFulltext() {
  //   this.fulltext = new PeriodicalFulltext();
  //   this.fulltext.limit = 40;
  //   this.fulltext.query = this.query.fulltext;
  //   this.fulltext.page = this.query.page || 1;
  //   if (this.isMonograph()) {
  //     this.orderingType = 'none';
  //   } else {
  //     this.orderingType = 'fulltext';
  //     this.fulltext.ordering = this.query.ordering;
  //   }
  //   const uuid1 = this.isPeriodicalVolume() ? this.document.root_uuid : this.query.uuid;
  //   const uuid2 = this.isPeriodicalVolume() ? this.query.uuid : null;
  //   this.api.getPeriodicalFulltextPages(uuid1, uuid2, this.fulltext.getOffset(), this.fulltext.limit, this.query).subscribe(response => {
  //     this.fulltext.pages = this.solrService.periodicalFtItems(response, this.fulltext.query);
  //     this.fulltext.results = this.solrService.numberOfResults(response);
  //     const issuePids = [];
  //     const volumePids = [];
  //     const unintPids = [];
  //     for (const item of this.fulltext.pages) {
  //       item.thumb = this.api.getThumbUrl(item.uuid);
  //       if (item.type === 'monograph_unit') {
  //         continue;
  //       }
  //       const unit = item.context['monographunit'];
  //       if (unintPids && unintPids.indexOf(unit) < 0) {
  //         unintPids.push(unit);
  //       }
  //       const issue = item.context['periodicalitem'];
  //       if (issue && issuePids.indexOf(issue) < 0) {
  //         issuePids.push(issue);
  //       }
  //       const supplement = item.context['supplement'];
  //       if (supplement && issuePids.indexOf(supplement) < 0) {
  //         issuePids.push(supplement);
  //       }
  //       const volume = item.context['periodicalvolume'];
  //       if (volume && issuePids.indexOf(volume) < 0) {
  //         volumePids.push(volume);
  //       }
  //     }
  //     if (this.isMonograph()) {
  //     this.api.getPeriodicalItemDetails(unintPids).subscribe(items => {
  //       for (const item of items['response']['docs']) {
  //         const detail = this.solrService.periodicalItem(item);
  //         for (const page of this.fulltext.pages) {
  //           page.type = 'monograph_unit_page';
  //           if (detail.uuid === page.context['monographunit']) {
  //               page.title = detail.title;
  //               page.part = detail.subtitle;
  //           }
  //         }
  //       }
  //     });
  //   } else {
  //     this.api.getPeriodicalItemDetails(volumePids).subscribe(items => {
  //       for (const item of items['response']['docs']) {
  //         const detail = this.solrService.periodicalItem(item);
  //         for (const page of this.fulltext.pages) {
  //           if (detail.uuid === page.context['periodicalvolume']) {
  //             page.year = detail.title;
  //             page.volume = detail.subtitle;
  //           }
  //         }
  //       }
  //     });
  //     this.api.getPeriodicalItemDetails(issuePids).subscribe(items => {
  //       for (const item of items['response']['docs']) {
  //         const detail = this.solrService.periodicalItem(item);
  //         for (const page of this.fulltext.pages) {
  //           if (detail.uuid === page.context['periodicalitem']) {
  //             page.date = detail.title;
  //             page.issue = detail.subtitle;
  //           } else if (detail.uuid === page.context['supplement']) {
  //             page.date = detail.title;
  //             page.supplement = detail.subtitle;
  //           }
  //         }
  //       }
  //     });
  //     }
  //     this.state = PeriodicalState.Success;
  //   });
  // }

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
    this.router.navigate(['periodical', this.query.uuid], { queryParams: this.query.toUrlParams(true) });
  }

  public changeSearchQuery(query: string) {
    this.query.setFulltext(query);
    this.reload();
  }

  public setAccessibility(accessibility: string) {
    this.query.setAccessibility(accessibility);
    this.reload();
  }

  public setOrdering(ordering: string) {
    this.analytics.sendEvent('periodical', 'ordering', ordering);
    this.query.setOrdering(ordering);
    this.reload();
  }


  public nextFtPage() {
    this.analytics.sendEvent('periodical', 'paginator', 'next');
    this.setFtPage(this.fulltext.page + 1);
  }

  public previousFtPage() {
    this.analytics.sendEvent('periodical', 'paginator', 'previous');
    this.setFtPage(this.fulltext.page - 1);
  }

  public onFtPage(page: number) {
    this.analytics.sendEvent('periodical', 'paginator', page + '');
    this.setFtPage(page);
  }

  private setFtPage(page: number) {
    this.query.setPage(page);
    this.reload();
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
    if (!this.settings.enablePeriodicalVolumesYearsLayout) {
      this.yearsLayoutEnabled = false;
      this.activeLayout = 'grid';
      this.state = PeriodicalState.Success;
      return;
    }
    for (const item of this.items) {
      if (item.date && !isNaN(item.date as any)) {
        const year = parseInt(item.date, 10);
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
    this.activeLayout = prefLayout ? prefLayout : this.settings.defaultPeriodicalVolumesLayout;
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
          if (this.items[j].date === String(i)) {
            item = this.items[j];
            break;
          }
        }
        if (!item) {
          item = new PeriodicalItem();
          item.date = String(i);
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
      if (item.date) {
        c = item.date.split('.');
      }
      let ok = false;
      if (c && c.length === 3) {
        console.log('sdfds');
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

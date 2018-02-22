import { query } from '@angular/core/src/animation/dsl';
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

  uuid: string;
  items: PeriodicalItem[];
  yearItems: PeriodicalItem[];
  minYear: number;
  maxYear: number;
  metadata: Metadata;
  document: DocumentItem;
  state: PeriodicalState = PeriodicalState.None;
  yearsLayoutEnabled: boolean;
  gridLayoutEnabled: boolean;
  calendarLayoutEnabled: boolean;
  activeLayout: string;
  dates: Date[];
  daysOfMonths: any[];
  daysOfMonthsItems: any[];
  activeMobilePanel: string;
  fulltext: PeriodicalFulltext;
  accessibility: string;
  volumeDetail;

  constructor(private solrService: SolrService,
    private router: Router,
    private modsParserService: ModsParserService,
    private localStorageService: LocalStorageService,
    private krameriusApiService: KrameriusApiService) {
  }

  init(uuid: string, fulltextQuery: string, fulltextPage: number, accessibility: string) {
    this.clear();
    this.uuid = uuid;
    this.accessibility = accessibility;
    this.state = PeriodicalState.Loading;
    this.krameriusApiService.getItem(uuid).subscribe((item: DocumentItem) => {
      this.document = item;
      this.krameriusApiService.getMods(this.document.root_uuid).subscribe(response => {
        this.metadata = this.modsParserService.parse(response, this.document.root_uuid);
        this.metadata.doctype = 'periodical';
        this.metadata.model = item.doctype;
        if (this.isMonograph()) {
          this.localStorageService.addToVisited(this.document, this.metadata);
          if (fulltextQuery) {
            // TODO
            this.initFulltext(uuid, null, fulltextQuery, fulltextPage);
          } else {
            this.krameriusApiService.getMonographUnits(uuid).subscribe(units => {
              this.assignItems(this.solrService.periodicalItems(units, 'monographunit'));
              this.initMonographUnit();
            });
          }
        } else if (this.isPeriodical()) {
          this.localStorageService.addToVisited(this.document, this.metadata);
          if (fulltextQuery) {
            this.initFulltext(uuid, null, fulltextQuery, fulltextPage);
          } else {
            this.krameriusApiService.getPeriodicalVolumes(uuid).subscribe(volumes => {
              this.assignItems(this.solrService.periodicalItems(volumes, 'periodicalvolume'));
              this.initPeriodical();
            });
          }
        } else if (this.isPeriodicalVolume()) {
          this.metadata.assignVolume(this.document);
          this.krameriusApiService.getPeriodicalVolumes(this.document.root_uuid).subscribe(volumes => {
            this.assignVolumeDetails(this.solrService.periodicalItems(volumes, 'periodicalvolume'));
          });
          if (fulltextQuery) {
            this.initFulltext(this.document.root_uuid, uuid, fulltextQuery, fulltextPage);
          } else {
            this.krameriusApiService.getPeriodicalIssues(this.document.root_uuid, uuid).subscribe(issues => {
              this.assignItems(this.solrService.periodicalItems(issues, 'periodicalitem', uuid));
              this.initPeriodicalVolume();
            });
          }
        }
      });
    });
  }


  changeActiveLayout(layout: string) {
    if (this.isPeriodical()) {
      this.localStorageService.setProperty(LocalStorageService.PERIODICAL_VOLUMES_LAYOUT, layout);
    } else if (this.isPeriodicalVolume()) {
      this.localStorageService.setProperty(LocalStorageService.PERIODICAL_ISSUES_LAYOUT, layout);
    }
    this.activeLayout = layout;
  }


  clear() {
    this.accessibility = 'all';
    this.yearsLayoutEnabled = false;
    this.gridLayoutEnabled = false;
    this.calendarLayoutEnabled = false;
    this.state = PeriodicalState.None;
    this.metadata = null;
    this.document = null;
    this.fulltext = null;
    this.yearItems = null;
    this.items = null;
    this.yearItems = null;
    this.volumeDetail = null;
    this.fulltext = null;
    this.dates = [];
    this.daysOfMonths = [];
    this.daysOfMonthsItems = [];
    this.activeMobilePanel = 'content';
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
    for (const item of this.items) {
      item.thumb = this.krameriusApiService.getThumbUrl(item.uuid);
    }
  }

  private initPeriodicalVolume() {
    this.yearsLayoutEnabled = false;
    this.gridLayoutEnabled = true;
    const year = this.document.volumeYear;
    const prefLayout = this.localStorageService.getProperty(LocalStorageService.PERIODICAL_ISSUES_LAYOUT);
    this.activeLayout = prefLayout ? prefLayout : 'calendar';
    if (year && !isNaN(year as any)) {
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


  private initFulltext(periodicalUuid: string, volumeUuid: string, fulltextQuery: string, fulltextPage: number) {
    this.fulltext = new PeriodicalFulltext();
    this.fulltext.limit = 40;
    this.fulltext.query = fulltextQuery;
    this.fulltext.page = fulltextPage || 1;
    this.krameriusApiService.getPeriodicalFulltextPages(periodicalUuid, volumeUuid, this.fulltext.query, this.fulltext.getOffset(), this.fulltext.limit, this.accessibility).subscribe(response => {
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

  public setFtPage(page: number) {
    this.router.navigate(['periodical', this.uuid],  { queryParams: { fulltext: this.fulltext.query, page: page} });
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
    }
    this.gridLayoutEnabled = true;
    this.calendarLayoutEnabled = false;
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
    this.activeLayout = prefLayout ? prefLayout : 'years';
    this.calcYearItems();
    this.state = PeriodicalState.Success;
  }

  private calcYearItems() {
    if ((this.maxYear - this.minYear + 1) > this.items.length) {
      this.yearItems = [];
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
  next: string;
  previous: string;
  pages: PeriodicalFtItem[];


  getOffset() {
    return this.limit * (this.page - 1);
  }

}

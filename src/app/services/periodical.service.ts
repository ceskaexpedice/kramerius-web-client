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

  constructor(private solrService: SolrService,
    private modsParserService: ModsParserService,
    private localStorageService: LocalStorageService,
    private krameriusApiService: KrameriusApiService) {
  }

  init(uuid: string) {
    this.clear();
    this.uuid = uuid;
    this.state = PeriodicalState.Loading;
    this.krameriusApiService.getItem(uuid).subscribe((item: DocumentItem) => {
      this.document = item;
      this.krameriusApiService.getMods(item.root_uuid).subscribe(response => {
        this.metadata = this.modsParserService.parse(response);
        this.metadata.volume.number = item.volumeNumber;
        this.metadata.volume.year = item.volumeYear;
        if (this.isPeriodical()) {
          this.localStorageService.addToVisited(item, this.metadata);
          this.krameriusApiService.getPeriodicalVolumes(uuid).subscribe(volumes => {
            this.items = this.solrService.periodicalItems(volumes);
            this.initPeriodical();
          });
        } else if (this.isPeriodicalVolume()) {
          this.krameriusApiService.getPeriodicalIssues(item.root_uuid, uuid).subscribe(issues => {
            this.items = this.solrService.periodicalItems(issues);
            this.initPeriodicalVolume();
          });
        }
      });
    });
  }

  changeActiveLayout(layout: string) {
    this.activeLayout = layout;
  }


  clear() {
    this.yearsLayoutEnabled = false;
    this.gridLayoutEnabled = false;
    this.calendarLayoutEnabled = false;
    this.state = PeriodicalState.None;
    this.metadata = null;
    this.document = null;
    this.items = null;
    this.yearItems = null;
    this.items = null;
    this.yearItems = null;
    this.dates = [];
    this.daysOfMonths = [];
    this.daysOfMonthsItems = [];
  }


  isPeriodicalVolume(): boolean {
    return this.document && this.document.doctype === 'periodicalvolume';
  }

  isPeriodical(): boolean {
    return this.document && this.document.doctype === 'periodical';
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




  private initPeriodicalVolume() {
    this.state = PeriodicalState.Success;
    this.yearsLayoutEnabled = false;
    this.gridLayoutEnabled = true;
    const year = this.document.volumeYear;
    if (year && !isNaN(year as any)) {
      this.calendarLayoutEnabled = true;
      if (this.calcCalender(year)) {
        this.activeLayout = 'calendar';
      } else {
        this.activeLayout = 'grid';
      }
    } else {
      this.activeLayout = 'grid';
      this.calendarLayoutEnabled = false;
    }
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
    this.activeLayout = 'years';
    this.calcYearItems();
    this.state = PeriodicalState.Success;
  }

  private calcYearItems() {
    if ((this.maxYear - this.minYear + 1) > this.items.length) {
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
      const c = item.title.split('.');
      let ok = false;
      if (c.length === 3) {
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

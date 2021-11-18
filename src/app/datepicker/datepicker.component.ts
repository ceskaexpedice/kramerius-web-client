import { Component, OnInit, Input  } from '@angular/core';
import {
  startOfMonth,
  endOfMonth,
  eachDay,
  getDate,
  getMonth,
  getYear,
  getDay,
  subDays,
  addDays
} from 'date-fns';
import { ISlimScrollOptions } from 'ngx-slimscroll';
import { AppSettings } from '../services/app-settings';
import { AnalyticsService } from '../services/analytics.service';

@Component({
  selector: 'app-datepicker',
  templateUrl: 'datepicker.component.html'
})
export class DatepickerComponent implements OnInit {
  @Input() date: Date;
  @Input() daysItems;
  scrollOptions: ISlimScrollOptions;
  days: {
    date: Date;
    day: number;
    month: number;
    year: number;
    tooltip?: string;
    inThisMonth: boolean;
    isActive: boolean;
    count: number;
  }[];

  constructor(public appSettings: AppSettings, public analytics: AnalyticsService) {
    this.scrollOptions = {
      barBackground: '#DFE3E9',
      gridBackground: '#FFFFFF',
      barBorderRadius: '3',
      gridBorderRadius: '3',
      barWidth: '6',
      gridWidth: '6',
      barMargin: '0',
      gridMargin: '0'
    };
  }

  ngOnInit() {
    this.init();
  }

  buildTooltip(items: any[]): string {
    if (!items || items.length < 1) {
      return '';
    }
    return items.map(a => a.title).join(", ");
  }

  init(): void {
    const start = startOfMonth(this.date);
    const end =  this.endOfMonth(start);
    this.days = eachDay(start, end).map(date => {
      const items = this.daysItems[date.getDate() + ''] || [];
      return {
        date: date,
        day: getDate(date),
        month: getMonth(date),
        year: getYear(date),
        count: items.length,
        tooltip: this.buildTooltip(items),
        items: items,
        inThisMonth: true,
        isActive: items.length > 0
      };
    });
    let pre = getDay(start);
    if (pre === 0) {
      pre = 7;
    }
    for (let i = 1; i <= pre - 1; i++) {
      const date = subDays(start, i);
      this.days.unshift({
        date: date,
        count: 0,
        day: getDate(date),
        month: getMonth(date),
        year: getYear(date),
        inThisMonth: false,
        isActive: false
      });
    }

    for (let i = 1; i < 42 - getDay(end); i++) {
      const date = addDays(end, i);
      this.days.push({
        date: date,
        day: getDate(date),
        count: 0,
        month: getMonth(date),
        year: getYear(date),
        inThisMonth: false,
        isActive: false
      });
    }



  }


  endOfMonth(date: Date) : Date {
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    endDate.setHours(12);
    return endDate;
  }

}

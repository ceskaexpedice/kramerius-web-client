import { PeriodicalItem } from './../../../model/periodicalItem.model';
import { Component, OnInit, Input } from '@angular/core';
import { DatepickerOptions } from 'ng2-datepicker';

@Component({
  selector: 'app-periodical-calendar-layout',
  templateUrl: './periodical-calendar-layout.component.html',
  styleUrls: ['./periodical-calendar-layout.component.scss']
})
export class PeriodicalCalendarLayoutComponent implements OnInit {
  @Input() items: PeriodicalItem[];
  @Input() year;

  dates: Date[] = [];

  daysOfMonths = [];
  daysOfMonthsItems = [];
  issuesWithoutDate = 0;

  constructor() {

  }


  ngOnInit() {
    this.calcCalender();
    for (const m of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
      // for (const m of [3]) {
        const date = new Date();
        date.setDate(3);
        date.setMonth(m);
        date.setFullYear(this.year);
        this.dates.push(date);
      }
  }

  private calcCalender() {
    if (!this.items) {
      return;
    }
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
        this.issuesWithoutDate++;
      }
    }
  }


}

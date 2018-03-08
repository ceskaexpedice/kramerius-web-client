import { PeriodicalService } from './../../services/periodical.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-periodical-filters',
  templateUrl: './periodical-filters.component.html'
})
export class PeriodicalFiltersComponent implements OnInit {

  yearFrom: number;
  yearTo: number;

  constructor(public periodicalService: PeriodicalService) {
  }

  ngOnInit() {
    this.yearFrom = this.periodicalService.query.from;
    this.yearTo = this.periodicalService.query.to;
  }


  onYearFromValueChanged() {
    if (!this.yearFrom || this.yearFrom < 0) {
      this.yearFrom = 0;
    } else if (this.yearFrom > this.yearTo) {
      this.yearFrom = this.yearTo;
    }
  }

  onYearToValueChanged() {
    const currentYear = (new Date()).getFullYear();
    if (!this.yearTo || this.yearTo > currentYear) {
      this.yearTo = currentYear;
    } else if (this.yearTo < this.yearFrom) {
      this.yearTo = this.yearFrom;
    }
  }

  applyYearRange() {
    this.periodicalService.setYearRange(this.yearFrom, this.yearTo);
  }





}

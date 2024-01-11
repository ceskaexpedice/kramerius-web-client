import { PeriodicalService } from './../../services/periodical.service';
import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';
import { AppSettings } from '../../services/app-settings';

@Component({
  selector: 'app-periodical-filters',
  templateUrl: './periodical-filters.component.html',
  styleUrls: ['./periodical-filters.component.scss']
})
export class PeriodicalFiltersComponent implements OnInit {

  yearFrom: number;
  yearTo: number;
  filters: string[];
  folderUuid: string;

  constructor(public periodicalService: PeriodicalService,
              public settings: AppSettings,
              public analytics: AnalyticsService) {
  }

  ngOnInit() {
    this.yearFrom = this.periodicalService.query.from;
    this.yearTo = this.periodicalService.query.to;
    this.filters = this.settings.filters;
    this.folderUuid = this.periodicalService.query.folderUuid;
    if (this.folderUuid) {
      this.periodicalService.assignFolder(this.folderUuid);
    }
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
    this.analytics.sendEvent('periodical', 'year', this.yearFrom + '-' + this.yearTo);
    this.periodicalService.setYearRange(this.yearFrom, this.yearTo);
  }

}

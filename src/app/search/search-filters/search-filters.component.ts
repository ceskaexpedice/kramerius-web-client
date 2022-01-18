import { SearchService } from './../../services/search.service';
import { Component, OnInit } from '@angular/core';
import { CollectionService } from '../../services/collection.service';
import { AppSettings } from '../../services/app-settings';
import { AnalyticsService } from '../../services/analytics.service';
import { LicenceService } from '../../services/licence.service';
import { MatDialog } from '@angular/material/dialog';
import { LicenceDialogComponent } from '../../dialog/licence-dialog/licence-dialog.component';

@Component({
  selector: 'app-search-filters',
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.scss']
})
export class SearchFiltersComponent implements OnInit {


  collapsedFilter = true;

  yearFrom: number;
  yearTo: number;
  filters: string[];

  constructor(public searchService: SearchService,
              public collectionService: CollectionService,
              public licences: LicenceService,
              public analytics: AnalyticsService,
              public settings: AppSettings,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.yearFrom = this.searchService.query.from;
    this.yearTo = this.searchService.query.to;
    this.filters = this.settings.filters;
  }

  showLicenceDialog(licence: String) {
    this.dialog.open(LicenceDialogComponent, { data: { licences: [licence] }, autoFocus: false });
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
    this.analytics.sendEvent('search', 'year', this.yearFrom + '-' + this.yearTo);
    this.searchService.setYearRange(this.yearFrom, this.yearTo);
  }

}

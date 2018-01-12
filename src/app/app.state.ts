import { Injectable } from '@angular/core';

@Injectable()
export class AppState {
  public activePage = '';

  showingChartBar: boolean = false;
  showingCalendar: boolean = false;
  showingFilters: boolean = true;
  
  // state of chart bar
  chartBarToggle() {
    this.showingChartBar = !this.showingChartBar;
  }
  
  // state of calendar
  calendarToggle() {
    this.showingCalendar = !this.showingCalendar;
  }
  
  // state of facets
  filtersToggle() {
    this.showingFilters = !this.showingFilters;
  }
}

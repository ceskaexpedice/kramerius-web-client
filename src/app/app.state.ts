import { Injectable } from '@angular/core';

@Injectable()
export class AppState {
  public activePage = '';

  showingChartBar: boolean = false;
  showingCalendar: boolean = false;
  showingPanelResult: boolean = true;
  showingPanelBrowse: boolean = true;
  showingPanelPeriodical: boolean = true;
  showingPanelMusic: boolean = true;
  showingSearchBar: boolean = false;

  // state of chart bar
  chartBarToggle() {
    this.showingChartBar = !this.showingChartBar;
  }

  // state of calendar
  calendarToggle() {
    this.showingCalendar = !this.showingCalendar;
  }

  // result facet state
  panelToggleResult() {
    this.showingPanelResult = !this.showingPanelResult;
  }

  // browse facet state
  panelToggleBrowse() {
    this.showingPanelBrowse = !this.showingPanelBrowse;
  }

  // periodical metadata state
  panelTogglePeriodical() {
    this.showingPanelPeriodical = !this.showingPanelPeriodical;
  }

  // music metadata state
  panelToggleMusic() {
    this.showingPanelMusic = !this.showingPanelMusic;
  }

  // search bar state for mobile version
  searchBarToggle() {
    this.showingSearchBar = !this.showingSearchBar;
  }
}

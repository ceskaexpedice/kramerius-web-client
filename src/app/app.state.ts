import { Injectable } from '@angular/core';

@Injectable()
export class AppState {
  public activePage = '';

  showingChartBar: boolean = false;
  showingCalendar: boolean = false;
  showingPanelResult: boolean = true;
  showingPanelBrowse: boolean = true;
  showingPanelPeriodical: boolean = true;
  showingPanelViewerNavigation: boolean = true;
  showingPanelViewerMetadata: boolean = true;
  showingPanelMusic: boolean = true;
  
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
  
  // viewer navigation state
  panelToggleViewerNavigation() {
    this.showingPanelViewerNavigation = !this.showingPanelViewerNavigation;
  }
  
  // viewer metadata state
  panelToggleViewerMetadata() {
    this.showingPanelViewerMetadata = !this.showingPanelViewerMetadata;
  }
  
  // music metadata state
  panelToggleMusic() {
    this.showingPanelMusic = !this.showingPanelMusic;
  }
}
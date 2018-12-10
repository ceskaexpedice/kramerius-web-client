import { AppSettings } from './services/app-settings';
import { Injectable } from '@angular/core';

@Injectable()
export class AppState {

  public pageUrl = '';
  private counter = 0;

  constructor(private appSettings: AppSettings) {}

  showingChartBar = false;
  showingCalendar = false;

  // state of chart bar
  chartBarToggle() {
    this.showingChartBar = !this.showingChartBar;
  }

  // state of calendar
  calendarToggle() {
    this.showingCalendar = !this.showingCalendar;
  }

  atHome(): boolean {
    this.counter ++;
    console.log('pageUrl', this.counter + ' ' + this.pageUrl);
    return (!this.appSettings.multiKramerius && this.pageUrl === '/') || (this.appSettings.multiKramerius && /^\/[a-z0-9]*\/?$/.test(this.pageUrl));
  }

  atSearchScreen(): boolean {
    return (!this.appSettings.multiKramerius && this.pageUrl.startsWith('/search')) || (this.appSettings.multiKramerius && /^\/[a-z0-9]*\/search.*$/.test(this.pageUrl));
  }

}

import { Injectable } from '@angular/core';

declare var APP_GLOBAL: any;

@Injectable()

export class AppSettings {

  public title = APP_GLOBAL.title;
  public logo = APP_GLOBAL.logo;
  public url = APP_GLOBAL.url;
  public share_url = APP_GLOBAL.share_url;
  public joinedDoctypes = APP_GLOBAL.joinedDoctypes;
  public doctypes = APP_GLOBAL.doctypes;
  public enablePeriodicalVolumesYearsLayout = APP_GLOBAL.enablePeriodicalVolumesYearsLayout;
  public enablePeriodicalIsssuesCalendarLayout = APP_GLOBAL.enablePeriodicalIsssuesCalendarLayout;
  public defaultPeriodicalVolumesLayout = APP_GLOBAL.defaultPeriodicalVolumesLayout;
  public defaultPeriodicalIsssuesLayout = APP_GLOBAL.defaultPeriodicalIssuesLayout;

}



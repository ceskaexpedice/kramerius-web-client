import { Injectable } from '@angular/core';

declare var APP_GLOBAL: any;

@Injectable()

export class AppSettings {

  public title = APP_GLOBAL.title;
  public logo = APP_GLOBAL.logo;
  public url = APP_GLOBAL.url;
  public joinedDoctypes = APP_GLOBAL.joinedDoctypes;
  public doctypes = APP_GLOBAL.doctypes;
}

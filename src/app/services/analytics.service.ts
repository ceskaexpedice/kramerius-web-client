import { Injectable } from '@angular/core';

@Injectable()
export class AnalyticsService {

  sendEvent(category: string, action: string, label: string = '') {
    (<any>window).gaaa('send', 'event', category, action, label);
  }

}

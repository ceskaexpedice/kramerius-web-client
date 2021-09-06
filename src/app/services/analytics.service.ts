import { Injectable } from '@angular/core';
import { MatomoTracker } from 'ngx-matomo';

@Injectable()
export class AnalyticsService {

  constructor(
    private matomoTracker: MatomoTracker
  ) { }

  sendEvent(category: string, action: string, label: string = '') {
    (<any>window).gaaa('send', 'event', category, action, label); //Google Analytics tracking

    this.matomoTracker.trackEvent(category, action, label); //Matomo tracking
  }

}

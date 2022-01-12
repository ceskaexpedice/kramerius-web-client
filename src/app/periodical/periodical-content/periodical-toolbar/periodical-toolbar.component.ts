import { PeriodicalService } from './../../../services/periodical.service';
import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../../services/analytics.service';

@Component({
  selector: 'app-periodical-toolbar',
  templateUrl: './periodical-toolbar.component.html',
  styleUrls: ['./periodical-toolbar.component.scss']
})
export class PeriodicalToolbarComponent implements OnInit {

  constructor(public periodicalService: PeriodicalService, public analytics: AnalyticsService) { }

  ngOnInit() {
  }

  selectLayout(layout: string) {
    this.analytics.sendEvent('periodical', 'layout', layout);
    this.periodicalService.changeActiveLayout(layout);
    this.periodicalService.activeMobilePanel = 'content';
  }

}

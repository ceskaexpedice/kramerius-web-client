import { PeriodicalService } from './../../../services/periodical.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AnalyticsService } from '../../../services/analytics.service';
import { AuthService } from '../../../services/auth.service';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-periodical-toolbar',
  templateUrl: './periodical-toolbar.component.html',
  styleUrls: ['./periodical-toolbar.component.scss']
})
export class PeriodicalToolbarComponent implements OnInit {

  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;


  constructor(public periodicalService: PeriodicalService, 
              public analytics: AnalyticsService,
              public auth: AuthService) { }

  ngOnInit() {
  }

  getOrderingOptions(): string[] {
    if (this.periodicalService.orderingType === 'periodical') {
      return ['earliest', 'latest'];
    } else if (this.periodicalService.orderingType === 'fulltext') {
      return ['relevance', 'earliest', 'latest'];
    } else {
      return [];
    }
  }

  selectLayout(layout: string) {
    this.analytics.sendEvent('periodical', 'layout', layout);
    this.periodicalService.changeActiveLayout(layout);
    this.periodicalService.activeMobilePanel = 'content';
  }

  changeOrdering(ordering: string) {
    this.menuTrigger.closeMenu();
    if (this.periodicalService.orderingType === 'periodical') {
      if (ordering === 'earliest') {
        this.periodicalService.setReverseOrder(false);
      } else if (ordering === 'latest') {
        this.periodicalService.setReverseOrder(true);
      }
    } else if (this.periodicalService.orderingType === 'fulltext') {
      this.periodicalService.setOrdering(ordering);
    } 
  }

}

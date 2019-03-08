import { PeriodicalService } from './../../../../services/periodical.service';
import { PeriodicalItem } from './../../../../model/periodicalItem.model';
import { Component, OnInit, Input } from '@angular/core';
import { AppSettings } from '../../../../services/app-settings';
import { AnalyticsService } from '../../../../services/analytics.service';

@Component({
  selector: 'app-periodical-grid-item',
  templateUrl: './periodical-grid-item.component.html'
})
export class PeriodicalGridItemComponent implements OnInit {
  @Input() item: PeriodicalItem;
  @Input() container;

  constructor(public periodicalService: PeriodicalService,
              public analytics: AnalyticsService,
              public appSettings: AppSettings) { }

  ngOnInit() {
  }

}

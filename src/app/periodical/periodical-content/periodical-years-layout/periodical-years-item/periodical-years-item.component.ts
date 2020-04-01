import { PeriodicalService } from './../../../../services/periodical.service';
import { PeriodicalItem } from './../../../../model/periodicalItem.model';
import { Component, OnInit, Input } from '@angular/core';
import { AppSettings } from '../../../../services/app-settings';
import { AnalyticsService } from '../../../../services/analytics.service';

@Component({
  selector: 'app-periodical-years-item',
  templateUrl: './periodical-years-item.component.html'
})
export class PeriodicalYearsItemComponent implements OnInit {
  @Input() item: PeriodicalItem;

  constructor(public periodicalService: PeriodicalService,
              public analytics: AnalyticsService,
              public settings: AppSettings) { }

  ngOnInit() {
  }


}

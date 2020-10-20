import { PeriodicalService } from './../../../../services/periodical.service';
import { PeriodicalItem } from './../../../../model/periodicalItem.model';
import { Component, OnInit, Input } from '@angular/core';
import { AppSettings } from '../../../../services/app-settings';
import { AnalyticsService } from '../../../../services/analytics.service';
import { AuthService } from '../../../../services/auth.service';
import { Translator } from 'angular-translator';

@Component({
  selector: 'app-periodical-grid-item',
  templateUrl: './periodical-grid-item.component.html'
})
export class PeriodicalGridItemComponent implements OnInit {
  @Input() item: PeriodicalItem;
  @Input() container;

  constructor(public periodicalService: PeriodicalService,
              public analytics: AnalyticsService,
              public auth: AuthService,
              private translator: Translator,
              public settings: AppSettings) { }

  ngOnInit() {
  }

}

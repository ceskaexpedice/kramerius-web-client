import { PeriodicalService } from './../../../../services/periodical.service';
import { PeriodicalItem } from './../../../../model/periodicalItem.model';
import { Component, Input } from '@angular/core';
import { AppSettings } from '../../../../services/app-settings';
import { AnalyticsService } from '../../../../services/analytics.service';
import { AuthService } from '../../../../services/auth.service';
import { LicenceService } from '../../../../services/licence.service';

@Component({
  selector: 'app-periodical-years-item',
  templateUrl: './periodical-years-item.component.html',
  styleUrls: ['./periodical-years-item.component.scss']
})
export class PeriodicalYearsItemComponent  {

  lock: any;

  _item: PeriodicalItem;

  @Input()
  set item(val: PeriodicalItem) {
    this._item = val;
    if(!this._item.licences) {
      return;
    }
    this.lock = this.licences.buildLock(this._item.licences, this._item.public);
  }

  constructor(public periodicalService: PeriodicalService,
              public analytics: AnalyticsService,
              private licences: LicenceService,
              public auth: AuthService,
              public settings: AppSettings) { }

}

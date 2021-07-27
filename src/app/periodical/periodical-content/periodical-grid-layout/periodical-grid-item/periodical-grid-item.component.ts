import { PeriodicalService } from './../../../../services/periodical.service';
import { PeriodicalItem } from './../../../../model/periodicalItem.model';
import { Component, OnInit, Input } from '@angular/core';
import { AppSettings } from '../../../../services/app-settings';
import { AnalyticsService } from '../../../../services/analytics.service';
import { AuthService } from '../../../../services/auth.service';
import { Translator } from 'angular-translator';
import { LicenceService } from '../../../../services/licence.service';

@Component({
  selector: 'app-periodical-grid-item',
  templateUrl: './periodical-grid-item.component.html'
})
export class PeriodicalGridItemComponent implements OnInit {
  @Input() item: PeriodicalItem;
  @Input() container;
  lock: any;


  constructor(public periodicalService: PeriodicalService,
              public analytics: AnalyticsService,
              public auth: AuthService,
              private licences: LicenceService,
              public translator: Translator,
              public settings: AppSettings) { }

  ngOnInit() {
    if (this.item.public || this.settings.hiddenLocks) {
      this.lock = null;
    } else {
      this.lock = this.licences.buildLock(this.item.licences);
    }
  }

}

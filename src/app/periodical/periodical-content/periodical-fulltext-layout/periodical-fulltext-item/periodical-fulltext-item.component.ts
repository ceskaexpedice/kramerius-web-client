import { AppSettings } from './../../../../services/app-settings';
import { DomSanitizer } from '@angular/platform-browser';
import { KrameriusApiService } from './../../../../services/kramerius-api.service';
import { PeriodicalFtItem } from './../../../../model/periodicalftItem.model';
import { Component, OnInit, Input } from '@angular/core';
import { AnalyticsService } from '../../../../services/analytics.service';
import { LicenceService } from '../../../../services/licence.service';

@Component({
  selector: 'app-periodical-fulltext-item',
  templateUrl: './periodical-fulltext-item.component.html',
  styleUrls: ['./periodical-fulltext-item.component.scss']
})
export class PeriodicalFulltextItemComponent implements OnInit {
  @Input() item: PeriodicalFtItem;
  lock: any;

  constructor(private krameriusApiService: KrameriusApiService,
    public settings: AppSettings,
    private licences: LicenceService,
    public analytics: AnalyticsService,
    private _sanitizer: DomSanitizer) { }

  ngOnInit() {
    if (this.item.public || this.settings.hiddenLocks) {
      this.lock = null;
    } else {
      this.lock = this.licences.buildLock(this.item.licences);
    }
  }

  getThumb() {
    const url = this.krameriusApiService.getThumbUrl(this.item.uuid);
    return this._sanitizer.bypassSecurityTrustStyle(`url(${url})`);
  }

}

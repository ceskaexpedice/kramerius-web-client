import { AppSettings } from './../../../../services/app-settings';
import { DomSanitizer } from '@angular/platform-browser';
import { KrameriusApiService } from './../../../../services/kramerius-api.service';
import { PeriodicalFtItem } from './../../../../model/periodicalftItem.model';
import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { AnalyticsService } from '../../../../services/analytics.service';

@Component({
  selector: 'app-periodical-fulltext-item',
  templateUrl: './periodical-fulltext-item.component.html',
})
export class PeriodicalFulltextItemComponent implements OnInit {
  @Input() item: PeriodicalFtItem;

  constructor(private krameriusApiService: KrameriusApiService,
    public appSettings: AppSettings,
    public analytics: AnalyticsService,
    private _sanitizer: DomSanitizer) { }

  ngOnInit() {
    console.log('item', this.item);
  }

  getThumb() {
    const url = this.krameriusApiService.getThumbUrl(this.item.uuid);
    return this._sanitizer.bypassSecurityTrustStyle(`url(${url})`);
  }

}

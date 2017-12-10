import { PeriodicalItem } from './../../../../model/periodicalItem.model';
import { DomSanitizer } from '@angular/platform-browser';
import { KrameriusApiService } from './../../../../services/kramerius-api.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-periodical-grid-item',
  templateUrl: './periodical-grid-item.component.html'
})
export class PeriodicalGridItemComponent implements OnInit {
  @Input() item: PeriodicalItem;

  constructor(private krameriusApiService: KrameriusApiService,
    private _sanitizer: DomSanitizer) { }

  ngOnInit() {
  }

  getThumb() {
    const url = this.krameriusApiService.getThumbUrl(this.item.uuid);
    return this._sanitizer.bypassSecurityTrustStyle(`url(${url})`);
  }


}

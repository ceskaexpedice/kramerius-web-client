import { DomSanitizer } from '@angular/platform-browser';
import { KrameriusApiService } from './../../../../services/kramerius-api.service';
import { PeriodicalFtItem } from './../../../../model/periodicalftItem.model';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-periodical-fulltext-item',
  templateUrl: './periodical-fulltext-item.component.html'
})
export class PeriodicalFulltextItemComponent implements OnInit {
  @Input() item: PeriodicalFtItem;

  constructor(private krameriusApiService: KrameriusApiService,
    private _sanitizer: DomSanitizer) { }

  ngOnInit() {
  }

  getThumb() {
    const url = this.krameriusApiService.getThumbUrl(this.item.uuid);
    return this._sanitizer.bypassSecurityTrustStyle(`url(${url})`);
  }

}

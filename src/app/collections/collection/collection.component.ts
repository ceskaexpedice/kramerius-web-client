import { Collection } from '../../model/collection.model';
import { Component, OnInit, Input } from '@angular/core';
import { KrameriusApiService } from '../../services/kramerius-api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnInit {

  @Input() collection: Collection;

  constructor(private krameriusApiService: KrameriusApiService,
              public analytics: AnalyticsService,
              private _sanitizer: DomSanitizer) { }

  ngOnInit() {
  }

  getThumb() {
    const url = this.krameriusApiService.getThumbUrl(this.collection.pid);
    return this._sanitizer.bypassSecurityTrustStyle(`url(${url})`);
  }

}

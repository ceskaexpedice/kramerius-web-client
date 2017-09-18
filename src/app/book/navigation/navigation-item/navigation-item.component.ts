import { KrameriusApiService } from './../../../services/kramerius-api.service';
import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-navigation-item',
  templateUrl: './navigation-item.component.html',
  styleUrls: ['./navigation-item.component.scss']
})
export class NavigationItemComponent implements OnInit {
  @Input() item;

  constructor(
    private krameriusApiService: KrameriusApiService,
    private _sanitizer: DomSanitizer) {
  }

  ngOnInit() {
  }

  getThumb() {
    const url = this.krameriusApiService.getThumbUrl(this.item.pid);
    return this._sanitizer.bypassSecurityTrustStyle(`url(${url})`);
  }

}

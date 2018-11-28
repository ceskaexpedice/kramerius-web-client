import { AppSettings } from './../../services/app-settings';
import { DocumentItem } from './../../model/document_item.model';
import { KrameriusApiService } from './../../services/kramerius-api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-document-card',
  templateUrl: './document-card.component.html'
})
export class DocumentCardComponent implements OnInit {
  @Input() item: DocumentItem;
  public thumb;

  constructor(private krameriusApiService: KrameriusApiService,
              public appSettings: AppSettings,
              private _sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.thumb = this.setThumb();
  }

  private setThumb() {
    let url = '';
    if (this.item.library) {
      const krameriusUrl = this.appSettings.getUrlByCode(this.item.library);
      url = this.krameriusApiService.getThumbUrlForKramerius(this.item.uuid, krameriusUrl);
    } else {
       url = this.krameriusApiService.getThumbUrl(this.item.uuid);
    }
    return this._sanitizer.bypassSecurityTrustStyle(`url(${url})`);
  }


}

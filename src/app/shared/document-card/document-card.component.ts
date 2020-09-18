import { AppSettings } from './../../services/app-settings';
import { DocumentItem } from './../../model/document_item.model';
import { KrameriusApiService } from './../../services/kramerius-api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Component, OnInit, Input } from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-document-card',
  templateUrl: './document-card.component.html'
})
export class DocumentCardComponent implements OnInit {
  @Input() item: DocumentItem;
  @Input() in: String;

  public thumb;

  constructor(private krameriusApiService: KrameriusApiService,
              public appSettings: AppSettings,
              public auth: AuthService,
              public analytics: AnalyticsService,
              private _sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.thumb = this.setThumb();
  }

  public getTitle(): string {
      var title = this.item.title;
    //  if(this.title=="") { return ""; }
      var mapObj = {'&quot;':'"', '&apos;':"'"};
      var re = new RegExp(Object.keys(mapObj).join("|"),"gi");
      return title.replace(re, function(matched){
        return mapObj[matched];
      });
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

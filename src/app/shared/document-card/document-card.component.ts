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

  constructor(private krameriusApiService: KrameriusApiService,
              private _sanitizer: DomSanitizer) { }

  ngOnInit() {
  }

  getThumb() {
    const url = this.krameriusApiService.getThumbUrl(this.item.uuid);
    return this._sanitizer.bypassSecurityTrustStyle(`url(${url})`);
  }


}

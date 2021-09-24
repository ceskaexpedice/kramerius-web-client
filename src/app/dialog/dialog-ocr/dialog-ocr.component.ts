import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal } from 'ngx-materialize';
import { ShareService } from '../../services/share.service';
import { CloudApiService } from '../../services/cloud-api.service';
import { AppSettings } from '../../services/app-settings';
import { Translator } from 'angular-translator';

@Component({
  selector: 'app-dialog-ocr',
  templateUrl: './dialog-ocr.component.html'
})
export class DialogOcrComponent extends MzBaseModal implements OnInit {

  @Input() ocr: string;
  @Input() ocr2: string;
  @Input() uuid: string;
  @Input() showCitation: boolean;

  citation: string;

  constructor(private cloudApi: CloudApiService, private translator: Translator, private shareService: ShareService, private settings: AppSettings) {
    super();
  }

  ngOnInit(): void {
    if (!this.showCitation) {
      return;
    }
    this.cloudApi.getCitation(this.uuid).subscribe( (citation: string) => {
      const link = this.shareService.getPersistentLink(this.uuid);
      const locText = String(this.translator.instant('availability'));
      this.citation = `${citation} ${locText}: ${link}`;
    });
  }


}

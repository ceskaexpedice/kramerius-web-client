import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal } from 'ngx-materialize';
import { KrameriusApiService } from '../../services/kramerius-api.service';
import { ShareService } from '../../services/share.service';

@Component({
  selector: 'app-dialog-ocr',
  templateUrl: './dialog-ocr.component.html'
})
export class DialogOcrComponent extends MzBaseModal implements OnInit {
  @Input() ocr: string;
  @Input() ocr2: string;
  @Input() uuid: string;
  citation: string;
  constructor(private api: KrameriusApiService, private shareService: ShareService) {
    super();
  }

  ngOnInit(): void {
    this.api.getCitation(this.uuid).subscribe( (citation: string) => {
      const link = this.shareService.getPersistentLink(this.uuid);
      this.citation = `${citation} Dostupné také z: ${link}`;
    });
  }



}

import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal } from 'ngx-materialize';
import { ShareService } from '../../services/share.service';
import { AppSettings } from '../../services/app-settings';
import { Translator } from 'angular-translator';
import { CitationService } from '../../services/citation.service';

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

  constructor(private citationService: CitationService, private translator: Translator, private shareService: ShareService, private settings: AppSettings) {
    super();
  }

  ngOnInit(): void {
    if (!this.showCitation) {
      return;
    }
    this.citationService.getCitation(this.uuid).subscribe( (citation: string) => {
      const link = this.shareService.getPersistentLink(this.uuid);
      const locText = this.translator.instant("share.available_from");
      this.citation = `${citation} ${locText}: ${link}`;
    });
  }


}

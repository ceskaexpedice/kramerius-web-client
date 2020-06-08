import { ShareService } from './../../services/share.service';
import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal } from 'ngx-materialize';
import { Metadata } from '../../model/metadata.model';
import { CloudApiService } from '../../services/cloud-api.service';
import { SolrService } from '../../services/solr.service';
import { Translator } from 'angular-translator';

@Component({
  selector: 'app-dialog-citation',
  templateUrl: './dialog-citation.component.html'
})
export class DialogCitationComponent extends MzBaseModal implements OnInit {
  @Input() citation: string;
  @Input() types: string[];
  @Input() metadata: Metadata;
  @Input() pages: string;

  data = [];
  selection;

  constructor(private cloudApi: CloudApiService, private shareService: ShareService, private translator: Translator) {
    super();
  }

  ngOnInit(): void {
    for (const doctype of SolrService.allDoctypes) {
      if (this.metadata.modsMap[doctype]) {
        this.data.push({
          type: doctype,
          citation: null,
          uuid: this.metadata.modsMap[doctype].uuid
        });
      }
    }
    if (this.metadata.activePage) {
      this.data.push({
        type: 'page',
        citation: null,
        uuid: this.metadata.activePage.uuid
      });
    }
    this.data.reverse();
    if (this.data.length > 0) {
      this.changeTab(this.data[0]);
    }
  }

  changeTab(item) {
    this.selection = item;
    if (!this.selection.citation) {
      this.cloudApi.getCitation(item.uuid).subscribe( (citation: string) => {
        const link = this.shareService.getPersistentLink(item.uuid);
        item.citation = `${citation} ${this.getLocalizedAvailability()}: ${link}`;
      });
    }
  }

  private getLocalizedAvailability(): string {
    return this.translator.language === 'cs' ? 'Dostupné také z' : 'Available also from';
  }

}

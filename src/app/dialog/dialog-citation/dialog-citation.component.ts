import { ShareService } from './../../services/share.service';
import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal } from 'ngx-materialize';
import { Metadata } from '../../model/metadata.model';
import { CloudApiService } from '../../services/cloud-api.service';

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

  doctypes = [
    ['article', 3],
    ['periodicalitem', 2],
    ['periodicalvolume', 1],
    ['periodical', 0],
    ['monographbundle', 0],
    ['monograph', 0],
    ['map', 0],
    ['sheetmusic', 0],
    ['graphic', 0],
    ['archive', 0],
    ['soundrecording', 0],
    ['manuscript', 0]
  ];


  constructor(private cloudApi: CloudApiService, private shareService: ShareService) {
    super();
  }

  ngOnInit(): void {
    for (const doctype of this.doctypes) {
      if (this.metadata.modsMap[doctype[0]]) {
        this.data.push({
          level:  Number(doctype[1]),
          citation: null,
          uuid: this.metadata.modsMap[doctype[0]].uuid
        });
      }
    }
    if (this.metadata.activePage) {
      this.data.push({
        level: 4,
        citation: null,
        uuid: this.metadata.activePage.uuid
      });
    }
    if (this.data.length > 0) {
      this.changeTab(this.data[0]);
    }
  }

  changeTab(item) {
    this.selection = item;
    if (!this.selection.citation) {
      this.cloudApi.getCitation(item.uuid).subscribe( (citation: string) => {
        const link = this.shareService.getPersistentLink(item.uuid);
        item.citation = `${citation} Dostupné také z: ${link}`;
      });
    }
  }

}

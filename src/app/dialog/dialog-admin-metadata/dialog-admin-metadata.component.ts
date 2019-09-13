import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal } from 'ngx-materialize';
import { Metadata } from '../../model/metadata.model';
import { KrameriusApiService } from '../../services/kramerius-api.service';
import { parseString, processors, Builder } from 'xml2js';


@Component({
  templateUrl: './dialog-admin-metadata.component.html'

})
export class DialogAdminMetadataComponent extends MzBaseModal implements OnInit {
  @Input() metadata: Metadata;
  doctypes = ['periodical', 'monographbundle', 'monograph', 'map', 'sheetmusic', 'graphic',
              'archive', 'soundrecording', 'manuscript', 'monographunit',
              'soundunit', 'track', 'periodicalvolume', 'periodicalitem',
              'article', 'internalpart', 'supplement', 'page'];
  data = [];
  selection;

  resource = 'mods';

  constructor(private api: KrameriusApiService) {
    super();
  }

  ngOnInit(): void {
    for (const doctype of this.doctypes) {
      if (this.metadata.modsMap[doctype]) {
        this.data.push({
          tab: doctype,
          uuid: this.metadata.modsMap[doctype].uuid
        });
      }
    }
    if (this.metadata.activePage) {
      this.data.push({
        tab: 'page',
        uuid: this.metadata.activePage.uuid
      });
    }
    if (this.data.length > 0) {
      this.changeTab(this.data[0]);
    }
  }

  changeResource(res) {
    this.resource = res;
    this.reload();
  }

  changeTab(item) {
    this.selection = item;
    this.reload();
  }

  reload() {
    if (!this.selection[this.resource]) {
      this.getRequest(this.selection.uuid).subscribe((result: string) => {
        if (this.resource === 'dc' || this.resource === 'mods' || this.resource === 'alto' || this.resource === 'foxml') {
          const data = {};
          const ctx = this;
          parseString(result, data, function (err, data) {
              const builder = new Builder({ 'headless': true });
              const xml = builder.buildObject(data);
              ctx.selection[ctx.resource] = xml;
          });
        } else if (this.resource === 'solr') {
          this.selection[this.resource] = JSON.stringify(result['response']['docs'][0], null, 2);
        } else if (this.resource === 'item' || this.resource === 'children' || this.resource === 'siblings' || this.resource === 'iiif') {
          this.selection[this.resource] = JSON.stringify(result, null, 2);
        } else {
          this.selection[this.resource] = result;
        }
      },
      () => {
        this.selection[this.resource] = `Objekt ${this.selection.tab.toUpperCase()} neobsahuje ${this.resource.toUpperCase()}`;
      });
    }
  }


  private getRequest(uuid: string) {
    switch (this.resource) {
      case 'mods': return this.api.getMods(uuid);
      case 'dc': return this.api.getDc(uuid);
      case 'solr': return this.api.getSearchResults(`q=PID:"${uuid}"`);
      case 'alto': return this.api.getAlto(uuid);
      case 'ocr': return this.api.getOcr(uuid);
      case 'foxml': return this.api.getFoxml(uuid);
      case 'item': return this.api.getRawItem(uuid);
      case 'children': return this.api.getChildren(uuid);
      case 'siblings': return this.api.getSiblings(uuid);
      case 'iiif': return this.api.getIiifPresentation(uuid);

    }
  }


}

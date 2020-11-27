import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal } from 'ngx-materialize';
import { Metadata } from '../../model/metadata.model';
import { KrameriusApiService } from '../../services/kramerius-api.service';
import { parseString, Builder } from 'xml2js';
import { SolrService } from '../../services/solr.service';
import { Translator } from 'angular-translator';


@Component({
  templateUrl: './dialog-admin-metadata.component.html'

})
export class DialogAdminMetadataComponent extends MzBaseModal implements OnInit {
  @Input() metadata: Metadata;
  data = [];
  selection;
  url: string;

  resource = 'mods';

  constructor(private api: KrameriusApiService, private solr: SolrService,private translator: Translator) {
    super();
  }

  ngOnInit(): void {
    for (const doctype of SolrService.allDoctypes) {
      if (this.metadata.context[doctype]) {
        this.data.push({
          tab: doctype,
          uuid: this.metadata.context[doctype]
        });
      }
    }
    if (this.metadata.activePage) {
      this.data.push({
        tab: 'page',
        uuid: this.metadata.activePage.uuid
      });
    }
    this.data.reverse();
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
    this.url = this.getUrl(this.selection.uuid);
    if (this.selection.tab === 'page' && this.resource === 'alto' && !this.metadata.isPublic) {
      this.selection[this.resource] = String(this.translator.instant('metadata-dialog.missing', 
      { 
        model: this.selection.tab.toUpperCase(),
        resource: this.resource.toUpperCase()
      }));
      return;
    } 
    if (!this.selection[this.resource]) {
      this.getRequest(this.selection.uuid).subscribe((result: string) => {
        if (this.resource === 'dc' || this.resource === 'mods' || this.resource === 'alto' || this.resource === 'foxml') {
          const params = {};
          const ctx = this;
          parseString(result, params, function (err: any, data) {
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
        this.selection[this.resource] = String(this.translator.instant('metadata-dialog.missing', 
        { 
          model: this.selection.tab.toUpperCase(),
          resource: this.resource.toUpperCase()
        }));
      });
    }
  }


  private getRequest(uuid: string) {
    switch (this.resource) {
      case 'mods': return this.api.getMods(uuid);
      case 'dc': return this.api.getDc(uuid);
      case 'solr': return this.api.getSearchResults(`q=${this.solr.field('id')}:"${uuid}"`);
      case 'alto': return this.api.getAlto(uuid);
      case 'ocr': return this.api.getOcr(uuid);
      case 'foxml': return this.api.getFoxml(uuid);
      case 'item': return this.api.getRawItem(uuid);
      case 'children': return this.api.getRawChildren(uuid);
      case 'iiif': return this.api.getIiifPresentation(uuid);
    }
  }

  private getUrl(uuid: string): string {
    switch (this.resource) {
      case 'mods': return this.api.getModsUrl(uuid);
      case 'solr': return this.api.getSearchResultsUrl(`q=${this.solr.field('id')}:"${uuid}"`);
      default: return null;
    }
  }


}

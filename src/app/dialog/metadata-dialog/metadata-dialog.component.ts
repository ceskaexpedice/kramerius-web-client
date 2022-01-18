
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { KrameriusApiService } from '../../services/kramerius-api.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { SolrService } from '../../services/solr.service';
import { parseString, Builder } from 'xml2js';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: './metadata-dialog.component.html',
  styleUrls: ['./metadata-dialog.component.scss']
})
export class MetadataDialogComponent implements OnInit {

  items = [];
  selection;
  url: string;

  resource: string;

  constructor(
    public dialogRef: MatDialogRef<MetadataDialogComponent>,
    private solr: SolrService,
    private api: KrameriusApiService,
    private locals: LocalStorageService,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) private data: any) { }



    ngOnInit(): void {
      this.resource = this.locals.getProperty('admin.metadata.resource') || 'mods';
      this.items = this.data.metadata.getFullContext(SolrService.allDoctypes);
      if (this.items.length == 1) {
        this.changeTab(this.items[0]);
      } else if (this.items.length > 1) {
        if (this.items[0].type == 'page') {
          this.changeTab(this.items[1]);
        } else {
          this.changeTab(this.items[0]);
        }
      }
    }
  
    changeResource(res) {
      this.resource = res;
      this.locals.setProperty('admin.metadata.resource', this.resource);
      this.reload();
    }
  
    changeTab(item) {
      this.selection = item;
      this.reload();
    }
  
    reload() {
      this.url = this.getUrl(this.selection.uuid);
      if (this.selection.type === 'page' && this.resource === 'alto' && !this.data.metadata.isPublic) {
        this.selection[this.resource] = String(this.translate.instant('metadata-dialog.missing', 
        { 
          model: this.selection.type.toUpperCase(),
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
          this.selection[this.resource] = String(this.translate.instant('metadata-dialog.missing', 
          { 
            model: this.selection.type.toUpperCase(),
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
        case 'alto': return this.api.getAltoUrl(uuid);
        case 'ocr': return this.api.getOcrUrl(uuid);
        case 'foxml': return this.api.getFoxmlUrl(uuid);
        //case 'item': return this.api.getItemUrl(uuid);
        case 'dc' : return this.api.getDcUrl(uuid);
        case 'iiif': return this.api.getIiifManifestUrl(uuid);
        default: return null;
      }
    }

  onCancel() {
    this.dialogRef.close();
  }

}

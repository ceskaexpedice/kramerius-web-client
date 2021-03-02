import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal, MzToastService } from 'ngx-materialize';
import { Metadata } from '../../model/metadata.model';
import { SolrService } from '../../services/solr.service';
import { KrameriusApiService } from '../../services/kramerius-api.service';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-dialog-admin',
  templateUrl: './dialog-admin.component.html'
})
export class DialogAdminComponent extends MzBaseModal implements OnInit {
  @Input() metadata: Metadata;

  data = [];
  selection;


  collectionsIn: any[];
  collectionsRest: any[];

  constructor(private api: KrameriusApiService, 
    private solr: SolrService,
    private adminApi: AdminApiService) {
    super();
  }

  ngOnInit(): void {
    for (const doctype of SolrService.allDoctypes) {
      if (this.metadata.context[doctype]) {
        const uuid = this.metadata.context[doctype];
        if (uuid) {
          this.data.push({
            type: doctype,
            uuid: uuid
          });
        }
      }
    }
    if (this.metadata.activePage) {
      this.data.push({
        type: 'page',
        uuid: this.metadata.activePage.uuid
      });
    }
    this.data.reverse();
    if (this.data.length > 0) {
      this.changeTab(this.data[0]);
    }
  }


  private loadCollections() {
    this.collectionsIn = [];
    this.collectionsRest = [];
    this.api.getSearchResults(`q=${this.solr.field('id')}:"${this.selection.uuid}"&fl=${this.solr.field('parent_collections')}`).subscribe((doc) => {
      const colsIn = doc['response']['docs'][0][this.solr.field('parent_collections')];
      this.api.getSearchResults(`q=${this.solr.field('model')}:collection&fl=${this.solr.field('id')},${this.solr.field('title')}&rows=100`).subscribe((result) => {
        const cols = result['response']['docs'];
        for (const col of cols) {
          const c = {
            uuid: col[this.solr.field('id')],
            name: col[this.solr.field('title')]
          }
          if (colsIn && colsIn.indexOf(c.uuid) >= 0) {
            this.collectionsIn.push(c);
          } else {
            this.collectionsRest.push(c);
          }
        }
      });
    });
  }

  changeTab(item) {
    this.selection = item;
    this.loadCollections();
  }

  removeFromCollection(col: any) {
    this.adminApi.removeItemFromCollection(col.uuid, this.selection.uuid).subscribe((aa) => {
      this.collectionsIn.splice(this.collectionsIn.indexOf(col), 1);
      this.collectionsRest.unshift(col);    
    });


  }

  addToCollection(col: any) {
    this.adminApi.addItemToCollection(col.uuid, this.selection.uuid).subscribe((aa) => {
      this.collectionsRest.splice(this.collectionsRest.indexOf(col), 1);
      this.collectionsIn.unshift(col);
    });
  }

}

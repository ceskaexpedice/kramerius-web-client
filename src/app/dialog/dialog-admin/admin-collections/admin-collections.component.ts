import { Component, OnInit, Input } from '@angular/core';
import { AdminApiService } from '../../../services/admin-api.service';
import { KrameriusApiService } from '../../../services/kramerius-api.service';
import { SolrService } from '../../../services/solr.service';
import { MzToastService } from 'ngx-materialize';


@Component({
  selector: 'app-admin-collections',
  templateUrl: './admin-collections.component.html'
})
export class AdminCollectionsComponent implements OnInit {

  collectionsIn: ACol[];
  collectionsAll: ACol[];
  collectionsRest: ACol[];

  query: string;
  state: string;

  _uuid: string;
  @Input() 
  set uuid(uuid: string) {
    this.onUuidChanged(uuid);
  }

  constructor(
    private api: KrameriusApiService, 
    private solr: SolrService,
    private toastService: MzToastService,
    private adminApi: AdminApiService) {
  }

  ngOnInit(): void {
  }

  onUuidChanged(uuid: string) {
    this.query = "";
    this._uuid = uuid;
    this.loadCollections();
  }

  private loadCollections() {
    console.log('op', this._uuid);
    this.state = 'loading';
    this.collectionsIn = [];
    this.collectionsAll = [];
    this.api.getSearchResults(`q=${this.solr.field('id')}:"${this._uuid}"&fl=${this.solr.field('parent_collections')}`).subscribe((doc) => {
      const colsIn = doc['response']['docs'][0][this.solr.field('parent_collections')];
      this.api.getSearchResults(`q=${this.solr.field('model')}:collection&fl=${this.solr.field('id')},${this.solr.field('collection_description')},${this.solr.field('title')}&sort=${this.solr.field('title_sort')} ASC&rows=1000`).subscribe((result) => {
        const cols = result['response']['docs'];
        for (const col of cols) {
          const c = {
            uuid: col[this.solr.field('id')],
            name: col[this.solr.field('title')],
            desc: col[this.solr.field('collection_description')] && col[this.solr.field('collection_description')].length > 0 ? col[this.solr.field('collection_description')][0] : ""
          }
          if (colsIn && colsIn.indexOf(c.uuid) >= 0) {
            this.collectionsIn.push(c);
          } else {
            this.collectionsAll.push(c);
          }
        }
        this.onCollectionSearchChange('');
        this.state = "ok";
      });
    });
  }


  removeFromCollection(col: any) {
    this.state = 'progress';
    this.adminApi.removeItemFromCollection(col.uuid, this._uuid).subscribe((aa) => {
      this.collectionsIn.splice(this.collectionsIn.indexOf(col), 1);
      this.collectionsRest.unshift(col);
      this.toastService.show("Odstranění objektu ze sbírky bylo naplánováno", 3000);
      this.state = 'ok';
    });
  }

  addToCollection(col: any) {
    this.state = 'progress';
    this.adminApi.addItemToCollection(col.uuid, this._uuid).subscribe((aa) => {
      this.collectionsRest.splice(this.collectionsRest.indexOf(col), 1);
      this.collectionsIn.unshift(col);
      this.toastService.show("Přidání objektu do sbírky bylo naplánováno", 3000);
      this.state = 'ok';
    });
  }

  onCollectionSearchChange(query: string) {
    this.collectionsRest = [];
    for (const col of this.collectionsAll) {
      if (!query || !col.name) {
        this.collectionsRest.push(col);
        continue;
      }
      const q = query.trim().toLocaleLowerCase();
      const n = col.name.trim().toLocaleLowerCase();
      if (n.startsWith(q)) {
        this.collectionsRest.push(col);
        continue;
      }
      const words = n.split(" ");
      for (const w of words) {
        if (w.startsWith(q)) {
          this.collectionsRest.push(col);
          break;
        }
      }
    }
  }

}



interface ACol {
  uuid: string;
  name: string;
  desc: string;
}
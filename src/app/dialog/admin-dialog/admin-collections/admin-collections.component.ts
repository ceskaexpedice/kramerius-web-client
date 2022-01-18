import { Component, OnInit, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminApiService } from '../../../services/admin-api.service';
import { KrameriusApiService } from '../../../services/kramerius-api.service';
import { SolrService } from '../../../services/solr.service';


@Component({
  selector: 'app-admin-collections',
  templateUrl: './admin-collections.component.html',
  styleUrls: ['./admin-collections.component.scss']
})
export class AdminCollectionsComponent implements OnInit {

  collectionsIn: ACol[];
  collectionsAll: ACol[];
  collectionsRest: ACol[];

  query: string;
  state: string;

  _uuids: string[];

  @Input() 
  set uuids(uuids: string[]) {
    this.onUuidChanged(uuids);
  }

  constructor(
    private api: KrameriusApiService, 
    private solr: SolrService,
    private snackBar: MatSnackBar,
    private adminApi: AdminApiService) {
  }

  ngOnInit(): void {
  }

  onUuidChanged(uuids: string[]) {
    this.query = "";
    this._uuids = uuids;
    this.state = 'loading';
    this.collectionsIn = [];
    this.collectionsAll = [];
    if (this._uuids.length == 1) {
      this.api.getSearchResults(`q=${this.solr.field('id')}:"${this._uuids[0]}"&fl=${this.solr.field('parent_collections')}`).subscribe((doc) => {
        const colsIn = doc['response']['docs'][0][this.solr.field('parent_collections')];
        this.loadCollections(colsIn);
      });
    } else {
      this.loadCollections();
    }
  }

  private loadCollections(isIn = null) {
      this.api.getSearchResults(`q=${this.solr.field('model')}:collection&fl=${this.solr.field('id')},${this.solr.field('collection_description')},${this.solr.field('title')}&sort=${this.solr.field('title_sort')} ASC&rows=1000`).subscribe((result) => {
        const cols = result['response']['docs'];
        for (const col of cols) {
          const c = {
            uuid: col[this.solr.field('id')],
            name: col[this.solr.field('title')],
            desc: col[this.solr.field('collection_description')] && col[this.solr.field('collection_description')].length > 0 ? col[this.solr.field('collection_description')][0] : ""
          }
          if (isIn && isIn.indexOf(c.uuid) >= 0) {
            this.collectionsIn.push(c);
          } else {
            this.collectionsAll.push(c);
          }
        }
        this.onCollectionSearchChange('');
        this.state = "ok";
      });
  }

  removeFromCollection(col: any) {
    if (this._uuids.length > 1) {
      return;
    }
    this.state = 'progress';
    this.adminApi.removeItemFromCollection(col.uuid, this._uuids[0]).subscribe(() => {
      this.collectionsIn.splice(this.collectionsIn.indexOf(col), 1);
      this.collectionsRest.unshift(col);
      this.snackBar.open("Odstranění objektu ze sbírky bylo naplánováno", '', { duration: 3000, verticalPosition: 'bottom' });
      this.state = 'ok';
    });
  }

  addToCollection(col: any, index = 0) {
    this.state = 'progress';
    this.adminApi.addItemToCollection(col.uuid, this._uuids[index]).subscribe(() => {
      if (index + 1 >= this._uuids.length) {
        this.collectionsRest.splice(this.collectionsRest.indexOf(col), 1);
        if (this._uuids.length == 1) {
          this.collectionsIn.unshift(col);
        }
        this.snackBar.open("Přidání objektu do sbírky bylo naplánováno", '', { duration: 3000, verticalPosition: 'bottom' });
        this.state = 'ok';
      } else {
        this.addToCollection(col, index + 1);
      }
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
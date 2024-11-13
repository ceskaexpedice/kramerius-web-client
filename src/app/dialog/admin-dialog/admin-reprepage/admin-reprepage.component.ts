import { Component, OnInit, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminApiService } from '../../../services/admin-api.service';
import { KrameriusApiService } from '../../../services/kramerius-api.service';
import { SolrService } from '../../../services/solr.service';

@Component({
  selector: 'app-admin-reprepage',
  templateUrl: './admin-reprepage.component.html',
  styleUrls: ['./admin-reprepage.component.scss']
})
export class AdminReprePageComponent implements OnInit {
  
  collections: ACol[];
  state: string;
  _uuid: string;
  objectPid: string;

  @Input() 
  set uuids(uuids: string[]) {
    this.onUuidChanged(uuids);
  }

  @Input() context: any;

  constructor(
    private api: KrameriusApiService, 
    private solr: SolrService,
    private snackBar: MatSnackBar,
    private adminApi: AdminApiService) {
  }

  ngOnInit(): void {
  }

  onUuidChanged(uuids: string[]) {
    this._uuid = uuids[0];
    this.state = 'loading';
    this.collections = [];
    console.log('pid', this._uuid);
    this.api.getSearchResults(`q=${this.solr.field('id')}:"${this._uuid}"&fl=${this.solr.field('ancestor_collections')}`).subscribe((doc) => {
      const colsIn = doc['response']['docs'][0][this.solr.field('ancestor_collections')];
      if (!colsIn) {
        this.state = "ok";
        return;
      }
      this.api.getSearchResults(`q=${this.solr.field('model')}:collection&fl=${this.solr.field('id')},${this.solr.field('collection_description')},${this.solr.field('title')}&sort=${this.solr.field('title_sort')} ASC&rows=1000`).subscribe((result) => {
        const cols = result['response']['docs'];
        for (const col of cols) {
          const c = {
            uuid: col[this.solr.field('id')],
            name: col[this.solr.field('title')],
            desc: col[this.solr.field('collection_description')] && col[this.solr.field('collection_description')].length > 0 ? col[this.solr.field('collection_description')][0] : ""
          }
          if (colsIn.indexOf(c.uuid) >= 0) {
            this.collections.push(c);
          }
        }
        this.state = "ok";
      });
    });
  }

  apply() {
    this.state = 'progress';
    this.adminApi.setReprePage(this.objectPid, this._uuid).subscribe(() => {
      this.snackBar.open("Reprezentativní strana byla nastavena", '', { duration: 3000, verticalPosition: 'bottom' });
      this.state = 'ok';
    });
  }


}



interface ACol {
  uuid: string;
  name: string;
  desc: string;
}
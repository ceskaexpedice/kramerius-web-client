import { Component, OnInit, Input } from '@angular/core';
import { AdminApiService } from '../../../services/admin-api.service';
import { KrameriusApiService } from '../../../services/kramerius-api.service';
import { SolrService } from '../../../services/solr.service';
import { AdminConfirmDialogComponent } from '../admin-confirm-dialog/admin-confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UiService } from '../../../services/ui.service';


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
    private ui: UiService,
    private adminApi: AdminApiService,
    private dialog: MatDialog) {
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

  removeFromCollectionDialog(col: any) {
    console.log('removeFromCollectionDialog');
    const dialogRef = this.dialog.open(AdminConfirmDialogComponent, { 
      data: {
        title: 'admin-dialog.remove_from_col_title',
        message: 'admin-dialog.remove_from_col_message',
        name: col.name,
        confirm: 'confirm',
        warn: true}, 
      autoFocus: false 
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.removeFromCollection(col);
      }
    });
  }

  removeFromCollection(col: any) {
    this.state = 'progress';
    if (this._uuids.length > 1) {
      for (const uuid of this._uuids) {
        this.adminApi.removeItemFromCollection(col.uuid, uuid).subscribe((result) => {
          this.ui.showStringSuccess("Odstranění objektů ze sbírky bylo naplánováno");
          this.state = 'ok';
        });
      }
    } else {
      this.adminApi.removeItemFromCollection(col.uuid, this._uuids[0]).subscribe(() => {
        this.collectionsIn.splice(this.collectionsIn.indexOf(col), 1);
        this.collectionsRest.unshift(col);
        this.ui.showStringSuccess("Odstranění objektu ze sbírky bylo naplánováno");
        this.state = 'ok';
      });
    }
  }

  addToCollectionDialog(col: any) {
    console.log('addToCollectionDialog');
    const dialogRef = this.dialog.open(AdminConfirmDialogComponent, { 
      data: {
        title: 'admin-dialog.add_to_col_title',
        message: 'admin-dialog.add_to_col_message',
        name: col.name,
        confirm: 'confirm',
        warn: true}, 
      autoFocus: false 
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addToCollection(col);
      }
    });
  }

  addToCollection(col: any) {
    this.state = 'progress';
    this.adminApi.addItemsToCollection(col.uuid, this._uuids).subscribe(() => {
      if (this._uuids.length == 1) {
        this.collectionsRest.splice(this.collectionsRest.indexOf(col), 1);
        this.collectionsIn.unshift(col);
      }
      this.ui.showStringSuccess("Přidání objektu do sbírky bylo naplánováno");
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
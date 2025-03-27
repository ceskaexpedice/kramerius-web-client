import { Component, OnInit, Inject } from '@angular/core';
import { Metadata } from '../../model/metadata.model';
import { SolrService } from '../../services/solr.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppSettings } from '../../services/app-settings';

@Component({
  templateUrl: './admin-dialog.component.html',
  styleUrls: ['./admin-dialog.component.scss']
})
export class AdminDialogComponent implements OnInit {

  metadata: Metadata;
  uuids: string[];

  items;
  selection;
  category;

  constructor(public dialogRef: MatDialogRef<AdminDialogComponent>,
    private locals: LocalStorageService,
    public settings: AppSettings,
    @Inject(MAT_DIALOG_DATA) private data: any) {
  }

  ngOnInit(): void {
    this.metadata = this.data.metadata;
    this.uuids = this.data.uuids;
    this.items = [];
    this.category = this.locals.getProperty('admin.edit.category') || 'accessibility';
    if (this.metadata) {
      // this.items.reverse();
      this.items = this.metadata.getFullContext(SolrService.allDoctypes);
      for (let item of this.items) {
        item.uuids = [item.uuid];
      }
      if (this.items.length == 1) {
        this.changeTab(this.items[0]);
      } else if (this.items.length > 1) {
        if (this.items[0].type == 'page') {
          this.changeTab(this.items[1]);
        } else {
          this.changeTab(this.items[0]);
        }
      }
    } else if (this.uuids) {
      this.items.push({
        type: 'multiple',
        uuids: this.uuids
      });
      this.changeTab(this.items[0]);
    }
    console.log('items', this.items);
  }

  changeTab(item) {
    this.selection = item;
    if (this.category == 'reprepage' && !this.reprePageAvailable()) {
      this.category = this.locals.getProperty('admin.edit.category') || 'accessibility';
    }
  }

  reprePageAvailable() {
    return this.selection && (this.selection.type == 'page' || this.selection.type == 'article');
  }

  changeCategory(category: string) {
    if (category != 'reprepage') {
      this.locals.setProperty('admin.edit.category', category);
    }
    this.category = category;
  }

  categoryLabel(category: string): string {
    switch (category) {
      case 'licences': return "Licence";
      case 'collections': return "Sbírky";
      case 'accessibility': return "Změna viditelnosti";
      case 'reindexation': return "Reindexace";
      case 'reprepage': return "Reprezentativní strana";
      default: return "-";
    }
  }

  openInAdmin() {
    // console.log(this.settings.adminClientUrl + '/object/' + this.selection.uuid);
    if (this.selection.type == 'multiple') {
      window.open(this.settings.adminClientUrl + '/object/' + this.selection.uuids[0], '_blank');
      return;
    } else {
      window.open(this.settings.adminClientUrl + '/object/' + this.selection.uuid , '_blank');
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

}
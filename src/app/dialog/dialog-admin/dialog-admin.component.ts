import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal } from 'ngx-materialize';
import { Metadata } from '../../model/metadata.model';
import { SolrService } from '../../services/solr.service';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'app-dialog-admin',
  templateUrl: './dialog-admin.component.html'
})
export class DialogAdminComponent extends MzBaseModal implements OnInit {

  @Input() metadata: Metadata;
  @Input() uuids: string[];

  data;
  selection;
  category;

  constructor(private locals: LocalStorageService) {
    super();
  }

  ngOnInit(): void {
    this.data = [];
    this.category = this.locals.getProperty('admin.edit.category') || 'accessibility';
    if (this.metadata) {
      this.data = this.metadata.getFullContext(SolrService.allDoctypes);
      for (let item of this.data) {
        item.uuids = [item.uuid];
      }
      if (this.data.length == 1) {
        this.changeTab(this.data[0]);
      } else if (this.data.length > 1) {
        if (this.data[0].type == 'page') {
          this.changeTab(this.data[1]);
        } else {
          this.changeTab(this.data[0]);
        }
      }
    } else if (this.uuids) {
      this.data.push({
        type: 'multiple',
        uuids: this.uuids
      });
      this.changeTab(this.data[0]);
    }
  }

  changeTab(item) {
    this.selection = item;
    if (this.category == 'reprepage' && !this.reprePageAvailable()) {
      this.category = this.locals.getProperty('admin.edit.category') || 'accessibility';
    }
  }

  reprePageAvailable() {
    return this.selection && this.selection.type == 'page';
  }

  changeCategory(category: string) {
    if (category != 'reprepage') {
      this.locals.setProperty('admin.edit.category', category);
    }
    this.category = category;
  }

  categoryLabel(category: string): string {
    switch (category) {
      case 'collections': return "Sbírky";
      case 'accessibility': return "Změna viditelnosti";
      case 'reindexation': return "Reindexace";
      case 'reprepage': return "Reprezentativní strana";
      default: return "-";
    }
  }

}

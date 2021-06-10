import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal } from 'ngx-materialize';
import { Metadata } from '../../model/metadata.model';
import { SolrService } from '../../services/solr.service';
import { KrameriusApiService } from '../../services/kramerius-api.service';
import { AdminApiService } from '../../services/admin-api.service';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'app-dialog-admin',
  templateUrl: './dialog-admin.component.html'
})
export class DialogAdminComponent extends MzBaseModal implements OnInit {

  @Input() metadata: Metadata;

  data = [];
  selection;
  category;

  constructor(private locals: LocalStorageService) {
    super();
  }

  ngOnInit(): void {
    this.category = this.locals.getProperty('admin.edit.category') || 'accessibility';
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
    if (this.data.length == 1) {
      this.changeTab(this.data[0]);
    } else if (this.data.length > 1) {
      if (this.data[0].type == 'page') {
        this.changeTab(this.data[1]);
      } else {
        this.changeTab(this.data[0]);
      }
    }
  }

  changeTab(item) {
    this.selection = item;
  }

  changeCategory(category: string) {
    this.locals.setProperty('admin.edit.category', this.category);
    this.category = category;
  }


  categoryLabel(category: string): string {
    switch (category) {
      case 'collections': return "Sbírky";
      case 'accessibility': return "Změna viditelnosti";
      case 'reindexation': return "Reindexace";
      default: return "-";
    }
  }


}
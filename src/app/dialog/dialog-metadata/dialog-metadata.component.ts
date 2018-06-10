import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal } from 'ngx-materialize';

@Component({
  selector: 'app-dialog-metadata',
  templateUrl: './dialog-metadata.component.html'
})
export class DialogMetadataComponent extends MzBaseModal implements OnInit {
  @Input() map;
  doctypes = ['periodical', 'monographbundle', 'monograph', 'map', 'sheetmusic', 'graphic',
              'archive', 'soundrecording', 'manuscript', 'monographunit',
              'soundunit', 'track', 'periodicalvolume', 'periodicalitem',
              'article', 'internalpart', 'supplement', 'page'];
  data = [];
  selection;

  ngOnInit(): void {
    for (const doctype of this.doctypes) {
      if (this.map[doctype]) {
        this.data.push({
          tab: doctype,
          mods: this.map[doctype]
        });
      }
    }
    if (this.data.length > 0) {
      this.selection = this.data[0];
    }
  }

  changeTab(item) {
    this.selection = item;
  }

}

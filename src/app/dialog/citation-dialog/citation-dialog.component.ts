
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CitationService } from '../../services/citation.service';
import { ShareService } from '../../services/share.service';
import { SolrService } from '../../services/solr.service';
import { AppSettings } from '../../services/app-settings';
import { UiService } from '../../services/ui.service';

@Component({
  templateUrl: './citation-dialog.component.html',
  styleUrls: ['./citation-dialog.component.scss']
})
export class CitationDialogComponent implements OnInit {

  items = [];
  selection;

  constructor(
    public dialogRef: MatDialogRef<CitationDialogComponent>,
    private citationService: CitationService,
    private shareService: ShareService,
    private ui: UiService,
    private settings: AppSettings,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) private data: any) { }


  ngOnInit(): void {
    this.items = this.data.metadata.getFullContext(SolrService.allDoctypesShareable);
    // if (this.data['pdfPageUuid']) {
    //   this.items.unshift({
    //     type: 'page',
    //     uuid: this.data['pdfPageUuid'],
    //   });
    // }
    if (this.items.length > 0) {
      this.changeTab(this.items[0]);
    }
  }

  changeTab(item) {
    this.selection = item;
    if (!this.selection.citation) {
      this.citationService.getCitation(item.uuid, (citation: string) => {
        const link = this.shareService.getPersistentLink(item.uuid);
        const locText = this.translate.instant("share.available_from");
        item.citation = `${citation} ${locText}: ${link}`;
        item.citationTxt = item.citation.replace(/(<([^>]+)>)/gi, "");
      });
    }
  }

  onCopied(callback) {
    if (callback && callback['isSuccess']) {
      this.ui.showSuccess('common.copied_to_clipboard');
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

}

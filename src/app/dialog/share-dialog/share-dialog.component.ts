
import { Component, OnInit, Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ShareService } from '../../services/share.service';
import { SolrService } from '../../services/solr.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.scss']
})
export class ShareDialogComponent implements OnInit {

  items = [];
  selection;

  constructor(
    public dialogRef: MatDialogRef<ShareDialogComponent>,
    private shareService: ShareService,
    private translate: TranslateService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) private data: any) { }



  ngOnInit(): void {
    this.items = this.data['metadata'].getFullContext(SolrService.allDoctypes);
    for (let item of this.items) {
      if (item.type == 'page') {
        item.link = this.shareService.getPersistentLinkByUrl();
      } else {
        item.link = this.shareService.getPersistentLink(item.uuid);
      }
    }
    if (this.items.length > 0) {
      this.selection = this.items[0];
    }
  }

  changeTab(item) {
    this.selection = item;
  }

  share(site) {
    if (!this.selection) {
      return;
    }
    let baseUrl = '';
    if (site === 'facebook') {
      baseUrl = 'https://www.facebook.com/sharer/sharer.php?u=';
    } else if (site === 'twitter') {
      baseUrl = 'https://www.twitter.com/intent/tweet?url=';
    } else {
      return;
    }
    const width = 500;
    const height = 500;
    window.open(baseUrl
         + encodeURIComponent(this.selection.link)
        , 'sharer', 'toolbar=0,status=0,width=' + width + ',height=' + height
        + ',top=' + (window.innerHeight - height) / 2 + ',left=' + (window.innerWidth - width) / 2);
  }

  onCopied(callback) {
    if (callback && callback['isSuccess']) {
      this.snackBar.open(<string> this.translate.instant('common.copied_to_clipboard'), '', { duration: 2000, verticalPosition: 'bottom' });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

}

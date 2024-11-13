import { Component, OnInit, Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ShareService } from '../../services/share.service';
import { TranslateService } from '@ngx-translate/core';
import { Folder } from '../../model/folder.model';

@Component({
  selector: 'app-folder-share-dialog',
  templateUrl: './folder-share-dialog.component.html',
  styleUrls: ['./folder-share-dialog.component.scss']
})
export class FolderShareDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<FolderShareDialogComponent>,
    private shareService: ShareService,
    private translate: TranslateService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) { }

  folder: Folder;
  link: string;

  ngOnInit(): void {
    this.folder = this.data['folder'];
    this.link = this.shareService.getPersistentLinkForFolder(this.folder.uuid);
    console.log('link', this.link);
  }

  share(site) {
    if (!this.link) {
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
         + encodeURIComponent(this.link)
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

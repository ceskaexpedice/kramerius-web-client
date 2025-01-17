
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ShareService } from '../../services/share.service';

@Component({
  templateUrl: './sheetmusic-similarity-dialog.component.html',
  styleUrls: ['./sheetmusic-similarity-dialog.component.scss']
})
export class SheetmusicSimilarityDialogComponent implements OnInit {

  items = [];

  constructor(
    public dialogRef: MatDialogRef<SheetmusicSimilarityDialogComponent>,
    private share: ShareService,
    @Inject(MAT_DIALOG_DATA) private data: any) { 
      this.items = data.hits;
  }
  
  ngOnInit(): void {
    
  }

  getLink(item) {
    return this.share.getPersistentLink(item._source.src_dig_lib_doc_id);
  }

  getThumb(item) {
    return item._source.img_thumb_url.replace('^', '!');
  }

  onCancel() {
    this.dialogRef.close();
  }

}

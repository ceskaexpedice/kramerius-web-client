
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  templateUrl: './similarity-dialog.component.html',
  styleUrls: ['./similarity-dialog.component.scss']
})
export class SimilarityDialogComponent implements OnInit {

  items = [];

  constructor(
    public dialogRef: MatDialogRef<SimilarityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any) { 
      this.items = data.matches;
  }
  


  ngOnInit(): void {
    
  }


  getTitle(metadata: any): string {
    if (metadata.root_title) {
      return metadata.root_title.split(':')[0];
   } else {
      return '';
    }
  }

  getKrameriusUrl(metadata: any): string {
    switch (metadata.source) {
      case 'mzk':
        return 'https://api.kramerius.mzk.cz';
      case 'svkpk':
        return 'https://kramerius.svkpk.cz';
      case 'svkos':
        return 'https://kramerius.svkos.cz';
      default:
        return '';
    }
  }


  getIIIFRegionUrl(metadata: any): string {
    return `${this.getKrameriusUrl(metadata)}/search/iiif/${metadata.page_uuid}/${metadata.bb}/max/0/default.jpg`;
  }
  

  onCancel() {
    this.dialogRef.close();
  }

}

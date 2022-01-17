
import { Component, OnInit, Inject } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Translator } from 'angular-translator';
import { ShareService } from '../../services/share.service';
import { SolrService } from '../../services/solr.service';

@Component({
  templateUrl: './licence-dialog.component.html',
  styleUrls: ['./licence-dialog.component.scss']
})
export class LicenceDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<LicenceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }


  ngOnInit(): void {
  }

  onCancel() {
    this.dialogRef.close();
  }

}


import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

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

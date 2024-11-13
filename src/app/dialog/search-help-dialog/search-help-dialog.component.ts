
import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  templateUrl: './search-help-dialog.component.html',
  styleUrls: ['./search-help-dialog.component.scss']
})
export class SearchHelpDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<SearchHelpDialogComponent>) {
    }

  ngOnInit(): void {
  }

  onCancel() {
    this.dialogRef.close();
  }

}

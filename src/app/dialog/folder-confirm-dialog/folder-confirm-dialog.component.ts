import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-folder-confirm-dialog',
  templateUrl: './folder-confirm-dialog.component.html',
  styleUrls: ['./folder-confirm-dialog.component.scss']
})
export class FolderConfirmDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<FolderConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }
  

  ngOnInit(): void {
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

}

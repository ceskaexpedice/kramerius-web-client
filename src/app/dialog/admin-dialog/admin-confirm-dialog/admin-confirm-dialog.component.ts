import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-admin-confirm-dialog',
  templateUrl: './admin-confirm-dialog.component.html',
  styleUrls: ['./admin-confirm-dialog.component.scss']
})
export class AdminConfirmDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<AdminConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }
    warn: boolean = false;
  
  ngOnInit(): void {
    this.warn = this.data.warn;
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

}

import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-folder-admin-dialog',
  templateUrl: './folder-admin-dialog.component.html',
  styleUrls: ['./folder-admin-dialog.component.scss']
})
export class FolderAdminDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<FolderAdminDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    console.log('selected uuids', this.data)
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

}

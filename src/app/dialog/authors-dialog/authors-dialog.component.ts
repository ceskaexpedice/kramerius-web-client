
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Author } from '../../model/metadata.model';
import { AnalyticsService } from '../../services/analytics.service';
import { AppSettings } from '../../services/app-settings';

@Component({
  templateUrl: './authors-dialog.component.html',
  styleUrls: ['./authors-dialog.component.scss']
})
export class AuthorsDialogComponent implements OnInit {

  authors: Author[];

  constructor(
    public dialogRef: MatDialogRef<AuthorsDialogComponent>,
    public analytics: AnalyticsService, public appSettings: AppSettings,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    }

  ngOnInit(): void {
    console.log('data', this.data);
    // this.authors = this.data.authors;

  }

  onCancel() {
    this.dialogRef.close();
  }

}

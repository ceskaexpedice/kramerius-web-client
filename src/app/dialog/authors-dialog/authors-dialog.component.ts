
import { Component, OnInit, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
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
    public analytics: AnalyticsService, 
    public settings: AppSettings,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    }

  ngOnInit(): void {
  }

  onCancel() {
    this.dialogRef.close();
  }

}

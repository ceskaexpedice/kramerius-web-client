
import { Component, OnInit, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { LicenceService } from '../../services/licence.service';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  templateUrl: './licence-dialog.component.html',
  styleUrls: ['./licence-dialog.component.scss']
})
export class LicenceDialogComponent implements OnInit {

  title: string = "";
  text: string = "";

  constructor(
    public dialogRef: MatDialogRef<LicenceDialogComponent>,
    private licenceService: LicenceService,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    this.loadLicences(this.data.licence);
  }

  onCancel() {
    this.dialogRef.close();
  }

  private loadLicences(licence: string) {
    this.title = this.licenceService.label(licence);
    const url = this.licenceService.message(licence);
    this.http.get(url, { observe: 'response', responseType: 'text' }).pipe(map(response => response['body'])).subscribe((result) => {
      this.text = result;
    });
  }

}

import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatLegacyMenuTrigger as MatMenuTrigger } from '@angular/material/legacy-menu';

@Component({
  templateUrl: './advanced-search-dialog.component.html',
  styleUrls: ['./advanced-search-dialog.component.scss']


})
export class AdvancedSearchDialogComponent implements OnInit {

  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;


  fieldType = 'all';
  fieldValue = '';

  fields = [
    'all', 'title', 'author', 'keyword', 'geoname', 'genre', 'publisher', 'publication_place', 'signature', 'issn', 'isbn'
  ];

  constructor(
    private dialogRef: MatDialogRef<AdvancedSearchDialogComponent>,
    private router: Router,
    private analytics: AnalyticsService,
    @Inject(MAT_DIALOG_DATA) private data: any) { 
      console.log('this.data.fieldType', this.data.fieldType);
      this.fieldType = this.data.fieldType;
      this.fieldValue = this.data.fieldValue;
    }

  ngOnInit(): void {

  }

  changeField(field: string) {
    this.menuTrigger.closeMenu();
    this.fieldType = field;
  }

  onSearch() {
    this.analytics.sendEvent('advanced search', 'field', this.fieldType + ':' + this.fieldValue);
    this.dialogRef.close();
    this.router.navigate(['search'],  { queryParams: { field: this.fieldType, value: this.fieldValue } });
  }

  onCancel() {
    this.dialogRef.close();
  }


}

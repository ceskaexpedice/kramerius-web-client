import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal } from 'ngx-materialize';
import { AnalyticsService } from '../../services/analytics.service';
import { AppSettings } from '../../services/app-settings';
import { Router } from '@angular/router';

@Component({
  templateUrl: './dialog-advanced-search.component.html'

})
export class DialogAdvancedSearchComponent extends MzBaseModal implements OnInit {



  @Input() fieldType = 'all';
  @Input() fieldValue = '';

  fields = [
    'all', 'title', 'author', 'keyword', 'geoname', 'issn', 'isbn', 'ddt', 'mdt'
  ];

  constructor(public analytics: AnalyticsService, public appSettings: AppSettings,
    private router: Router,
    ) {
    super();
  }

  ngOnInit(): void {

  }

  onKeydown(event) {
    if (event.key === "Enter") {
      console.log(event);
      if (this.fieldValue) {
        this.onSearch();
      }
    }
  }

  onSearch() {
    this.modalComponent.closeModal();
    this.analytics.sendEvent('advanced search', 'field', this.fieldType + ':' + this.fieldValue);
    this.router.navigate(['search'],  { queryParams: { field: this.fieldType, value: this.fieldValue } });
  }

}

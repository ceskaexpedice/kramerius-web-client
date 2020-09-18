import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal } from 'ngx-materialize';
import { Author } from '../../model/metadata.model';
import { AnalyticsService } from '../../services/analytics.service';
import { AppSettings } from '../../services/app-settings';

@Component({
  selector: 'app-dialog-authors',
  templateUrl: './dialog-authors.component.html'
})
export class DialogAuthosComponent extends MzBaseModal implements OnInit {
  @Input() authors: Author[];

  constructor(public analytics: AnalyticsService, public appSettings: AppSettings) {
    super();
  }

  ngOnInit(): void {
  }



}

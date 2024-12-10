import { Component, OnInit, Input } from '@angular/core';
import { AdminApiService } from '../../../services/admin-api.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-admin-accessibility',
  templateUrl: './admin-accessibility.component.html',
  styleUrls: ['./admin-accessibility.component.scss']
})
export class AdminAccessibilityComponent implements OnInit {

  state: string;
  _uuids: string[];

  accessibility: string;
  scope: string;

  @Input() 
  set uuids(uuids: string[]) {
    this.onUuidChanged(uuids);
  }

  constructor(
    private ui: UiService,
    private adminApi: AdminApiService) {
  }

  ngOnInit(): void {
    this.accessibility = 'PUBLIC';
    this.scope = 'OBJECT';
  }

  onUuidChanged(uuids: string[]) {
    this._uuids = uuids;
    this.state = 'ok';
  }

  apply(index = 0) {
    this.state = 'progress';
    this.adminApi.changeAccessibility(this._uuids[index], this.scope, this.accessibility).subscribe(() => {
      if (index + 1 >= this._uuids.length) {
        this.ui.showStringSuccess("Změna viditelnosti byla naplánována");
        this.state = 'ok';
      } else {
        this.apply(index + 1);
      }
    });
  }



}
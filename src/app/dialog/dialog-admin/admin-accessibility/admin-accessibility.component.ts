import { Component, OnInit, Input } from '@angular/core';
import { AdminApiService } from '../../../services/admin-api.service';
import { MzToastService } from 'ngx-materialize';

@Component({
  selector: 'app-admin-accessibility',
  templateUrl: './admin-accessibility.component.html'
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
    private toastService: MzToastService,
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
        this.toastService.show("Změna viditelnosti byla naplánována", 3000);
        this.state = 'ok';
      } else {
        this.apply(index + 1);
      }
    });
  }



}
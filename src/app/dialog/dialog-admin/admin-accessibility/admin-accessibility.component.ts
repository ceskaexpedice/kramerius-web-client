import { Component, OnInit, Input } from '@angular/core';
import { AdminApiService } from '../../../services/admin-api.service';
import { MzToastService } from 'ngx-materialize';


@Component({
  selector: 'app-admin-accessibility',
  templateUrl: './admin-accessibility.component.html'
})
export class AdminAccessibilityComponent implements OnInit {

  state: string;
  _uuid: string;

  accessibility: string;
  scope: string;

  @Input() 
  set uuid(uuid: string) {
    this.onUuidChanged(uuid);
  }

  constructor(
    private toastService: MzToastService,
    private adminApi: AdminApiService) {
  }

  ngOnInit(): void {
    this.accessibility = 'PUBLIC';
    this.scope = 'OBJECT';
  }

  onUuidChanged(uuid: string) {
    this._uuid = uuid;
    this.state = 'ok';
  }

  apply() {
    this.state = 'progress';
    this.adminApi.changeAccessibility(this._uuid, this.scope, this.accessibility).subscribe(() => {
      this.toastService.show("Změna viditelnosti byla naplánována", 3000);
      this.state = 'ok';
    });
  }

}
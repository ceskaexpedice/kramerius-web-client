import { Component, OnInit, Input } from '@angular/core';
import { AdminApiService } from '../../../services/admin-api.service';
import { MzToastService } from 'ngx-materialize';


@Component({
  selector: 'app-admin-reindexation',
  templateUrl: './admin-reindexation.component.html'
})
export class AdminReindexationComponent implements OnInit {

  state: string;
  _uuid: string;

  type: string;

  @Input() 
  set uuid(uuid: string) {
    this.onUuidChanged(uuid);
  }

  constructor(
    private toastService: MzToastService,
    private adminApi: AdminApiService) {
  }

  ngOnInit(): void {
    this.type = 'OBJECT';
  }

  onUuidChanged(uuid: string) {
    this._uuid = uuid;
    this.state = 'ok';
  }

  apply() {
    this.state = 'progress';
    this.adminApi.reindex(this._uuid, this.type).subscribe(() => {
      this.toastService.show("Reindexace byla naplánována", 3000);
      this.state = 'ok';
    });
  }

}
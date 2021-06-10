import { Component, OnInit, Input } from '@angular/core';
import { AdminApiService } from '../../../services/admin-api.service';
import { MzToastService } from 'ngx-materialize';


@Component({
  selector: 'app-admin-reindexation',
  templateUrl: './admin-reindexation.component.html'
})
export class AdminReindexationComponent implements OnInit {

  state: string;
  _uuids: string[];

  type: string;

  @Input() 
  set uuids(uuids: string[]) {
    this.onUuidChanged(uuids);
  }

  constructor(
    private toastService: MzToastService,
    private adminApi: AdminApiService) {
  }

  ngOnInit(): void {
    this.type = 'OBJECT';
  }

  onUuidChanged(uuids: string[]) {
    this._uuids = uuids;
    this.state = 'ok';
  }

  apply(index = 0) {
    this.state = 'progress';
    this.adminApi.reindex(this._uuids[index], this.type).subscribe(() => {
      if (index + 1 >= this._uuids.length) {
        this.toastService.show("Reindexace byla naplánována", 3000);
        this.state = 'ok';
      } else {
        this.apply(index + 1);
      }
    });
  }

}
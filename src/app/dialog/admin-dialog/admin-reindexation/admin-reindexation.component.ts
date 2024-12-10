import { Component, OnInit, Input } from '@angular/core';
import { AdminApiService } from '../../../services/admin-api.service';
import { UiService } from '../../../services/ui.service';

@Component({
  selector: 'app-admin-reindexation',
  templateUrl: './admin-reindexation.component.html',
  styleUrls: ['./admin-reindexation.component.scss']
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
    private ui: UiService,
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
        this.ui.showStringSuccess("Reindexace byla naplánována");
        this.state = 'ok';
      } else {
        this.apply(index + 1);
      }
    });
  }

}
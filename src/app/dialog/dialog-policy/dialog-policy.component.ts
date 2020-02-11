import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal } from 'ngx-materialize';
import { AppSettings } from '../../services/app-settings';
import { KrameriusInfoService } from '../../services/kramerius-info.service';

@Component({
  selector: 'app-dialog-policy',
  templateUrl: './dialog-policy.component.html'
})
export class DialogPolicyComponent extends MzBaseModal implements OnInit {
  @Input() type: string;

  constructor(
              public krameriusInfo: KrameriusInfoService,
              public appSettings: AppSettings) {
    super();
  }

  ngOnInit(): void {
  }



}

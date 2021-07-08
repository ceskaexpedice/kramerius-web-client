import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal } from 'ngx-materialize';

@Component({
  selector: 'app-dialog-licences',
  templateUrl: './dialog-licences.component.html'
})
export class DialogLicencesComponent extends MzBaseModal implements OnInit {
  
  @Input() licences: string[];
  @Input() full: boolean;

  constructor() {
    super();
  }

  ngOnInit(): void {
  }



}

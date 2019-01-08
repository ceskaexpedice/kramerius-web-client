import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal } from 'ngx-materialize';

@Component({
  selector: 'app-dialog-citation',
  templateUrl: './dialog-citation.component.html'
})
export class DialogCitationComponent extends MzBaseModal implements OnInit {
  @Input() citation: string;

  ngOnInit(): void {

  }

  constructor() {
    super();
  }


}

import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal } from 'ng2-materialize';

@Component({
  selector: 'app-simple-dialog',
  templateUrl: './simple-dialog.component.html'
})
export class SimpleDialogComponent extends MzBaseModal implements OnInit {

  @Input() title: string;
  @Input() message: string;
  @Input() button: string;

  ngOnInit(): void {

  }

}

import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal } from 'ng2-materialize';

@Component({
  selector: 'app-sheetmusic-warning-share',
  templateUrl: './dialog-sheetmusic-warning.component.html'
})
export class DialogSheetmusicWarningComponent extends MzBaseModal implements OnInit {
  @Input() link: string;

  ngOnInit(): void {

  }

}

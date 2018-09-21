import { Component, OnInit, Input } from '@angular/core';
import { MzBaseModal } from 'ngx-materialize';
import { Author } from '../../model/metadata.model';

@Component({
  selector: 'app-dialog-authors',
  templateUrl: './dialog-authors.component.html'
})
export class DialogAuthosComponent extends MzBaseModal implements OnInit {
  @Input() authors: Author[];

  ngOnInit(): void {

  }


}

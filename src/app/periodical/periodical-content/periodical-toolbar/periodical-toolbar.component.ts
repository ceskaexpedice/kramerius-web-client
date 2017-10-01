import { Metadata } from './../../../model/metadata.model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-periodical-toolbar',
  templateUrl: './periodical-toolbar.component.html',
  styleUrls: ['./periodical-toolbar.component.scss']
})
export class PeriodicalToolbarComponent implements OnInit {

  @Input() metadata: Metadata;
  @Input() activeLayout: string;
  @Output() layoutSelected = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  selectLayout(layout: string) {
    this.layoutSelected.emit(layout);
  }

}

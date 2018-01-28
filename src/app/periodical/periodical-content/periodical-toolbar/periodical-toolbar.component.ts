import { PeriodicalService } from './../../../services/periodical.service';
import { Metadata } from './../../../model/metadata.model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-periodical-toolbar',
  templateUrl: './periodical-toolbar.component.html'
})
export class PeriodicalToolbarComponent implements OnInit {

  constructor(public periodicalService: PeriodicalService) { }

  ngOnInit() {
  }

  selectLayout(layout: string) {
    this.periodicalService.changeActiveLayout(layout);
    this.periodicalService.activeMobilePanel = 'content';
  }

}

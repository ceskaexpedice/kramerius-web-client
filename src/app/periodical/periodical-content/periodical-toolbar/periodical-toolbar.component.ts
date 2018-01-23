import { PeriodicalService } from './../../../services/periodical.service';
import { Metadata } from './../../../model/metadata.model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AppState } from './../../../app.state';


@Component({
  selector: 'app-periodical-toolbar',
  templateUrl: './periodical-toolbar.component.html'
})
export class PeriodicalToolbarComponent implements OnInit {

  constructor(public periodicalService: PeriodicalService, public state: AppState) { }

  ngOnInit() {
  }

  selectLayout(layout: string) {
    this.periodicalService.changeActiveLayout(layout);
    this.state.showingPanelPeriodical = true;
  }

  // hide panel - pedro
  hidePanel() {
    //this.state.panelTogglePeriodical();
    this.state.showingPanelPeriodical = false;
  }
}

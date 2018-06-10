import { PeriodicalService } from './../../../services/periodical.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-periodical-toolbar',
  templateUrl: './periodical-toolbar.component.html'
})
export class PeriodicalToolbarComponent implements OnInit {

  constructor(public periodicalService: PeriodicalService) { }

  ngOnInit() {
    console.log(this.periodicalService.metadata.titles[0].maintTitle());
  }

  selectLayout(layout: string) {
    this.periodicalService.changeActiveLayout(layout);
    this.periodicalService.activeMobilePanel = 'content';
  }

}

import { PeriodicalService } from '../../../services/periodical.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-periodical-title-layout',
  templateUrl: './periodical-title-layout.component.html'
})
export class PeriodicalTitleLayoutComponent implements OnInit {

  container;

  constructor(public periodicalService: PeriodicalService) { }

  ngOnInit() {
    this.container = document.getElementById('app-periodical-title-container');
  }

}

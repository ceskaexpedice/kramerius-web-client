import { PeriodicalService } from './../../../services/periodical.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-periodical-grid-layout',
  templateUrl: './periodical-grid-layout.component.html',
  styleUrls: ['./periodical-grid-layout.component.scss']
})
export class PeriodicalGridLayoutComponent implements OnInit {

  container;

  constructor(public periodicalService: PeriodicalService) { }

  ngOnInit() {
    this.container = document.getElementById('app-periodical-grid-container');
  }

}

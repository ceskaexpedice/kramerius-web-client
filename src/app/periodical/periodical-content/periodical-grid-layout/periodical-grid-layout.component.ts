import { PeriodicalService } from './../../../services/periodical.service';
import { PeriodicalItem } from './../../../model/periodicalItem.model';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-periodical-grid-layout',
  templateUrl: './periodical-grid-layout.component.html'
})
export class PeriodicalGridLayoutComponent implements OnInit {

  constructor(public periodicalService: PeriodicalService) { }

  ngOnInit() {
  }

}

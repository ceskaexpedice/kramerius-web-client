import { PeriodicalService } from '../../../services/periodical.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-periodical-unit-layout',
  templateUrl: './periodical-unit-layout.component.html'
})
export class PeriodicalUnitLayoutComponent implements OnInit {

  constructor(public periodicalService: PeriodicalService) { }

  ngOnInit() {
  }

}

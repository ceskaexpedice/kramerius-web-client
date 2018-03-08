import { PeriodicalService } from './../../services/periodical.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-periodical-filters',
  templateUrl: './periodical-filters.component.html'
})
export class PeriodicalFiltersComponent implements OnInit {

  constructor(public periodicalService: PeriodicalService) { }

  ngOnInit() {
  }

}

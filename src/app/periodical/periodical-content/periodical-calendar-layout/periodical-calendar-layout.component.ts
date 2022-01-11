import { PeriodicalService } from './../../../services/periodical.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-periodical-calendar-layout',
  templateUrl: './periodical-calendar-layout.component.html',
  styleUrls: ['./periodical-calendar-layout.component.scss']

})
export class PeriodicalCalendarLayoutComponent implements OnInit {

  constructor(public periodicalService: PeriodicalService) {
  }


  ngOnInit() {
  }

}

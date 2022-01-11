import { PeriodicalService } from './../../../services/periodical.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-periodical-years-layout',
  templateUrl: './periodical-years-layout.component.html',
  styleUrls: ['./periodical-years-layout.component.scss']
})
export class PeriodicalYearsLayoutComponent implements OnInit {

  constructor(public periodicalService: PeriodicalService) { }

  ngOnInit() {
  }

}

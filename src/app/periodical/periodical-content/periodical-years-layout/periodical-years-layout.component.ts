import { PeriodicalItem } from './../../../model/periodicalItem.model';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-periodical-years-layout',
  templateUrl: './periodical-years-layout.component.html',
  styleUrls: ['./periodical-years-layout.component.scss']
})
export class PeriodicalYearsLayoutComponent implements OnInit {
  @Input() items: PeriodicalItem[];

  constructor() { }

  ngOnInit() {
  }

}

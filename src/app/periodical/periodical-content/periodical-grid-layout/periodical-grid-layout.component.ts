import { PeriodicalItem } from './../../../model/periodicalItem.model';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-periodical-grid-layout',
  templateUrl: './periodical-grid-layout.component.html',
  styleUrls: ['./periodical-grid-layout.component.scss']
})
export class PeriodicalGridLayoutComponent implements OnInit {
  @Input() items: PeriodicalItem[];

  constructor() { }

  ngOnInit() {
  }

}

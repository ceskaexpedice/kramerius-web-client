import { PeriodicalItem } from './../../../../model/periodicalItem.model';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-periodical-grid-item',
  templateUrl: './periodical-grid-item.component.html'
})
export class PeriodicalGridItemComponent implements OnInit {
  @Input() item: PeriodicalItem;
  @Input() container;
  constructor() { }

  ngOnInit() {
  }

}

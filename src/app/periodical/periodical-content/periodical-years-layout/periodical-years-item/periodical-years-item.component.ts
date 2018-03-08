import { PeriodicalService } from './../../../../services/periodical.service';
import { PeriodicalItem } from './../../../../model/periodicalItem.model';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-periodical-years-item',
  templateUrl: './periodical-years-item.component.html'
})
export class PeriodicalYearsItemComponent implements OnInit {
  @Input() item: PeriodicalItem;

  constructor(public periodicalService: PeriodicalService) { }

  ngOnInit() {
  }


}

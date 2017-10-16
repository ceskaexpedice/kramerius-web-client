import { PeriodicalItem } from './../../../../model/periodicalItem.model';
import { DomSanitizer } from '@angular/platform-browser';
import { KrameriusApiService } from './../../../../services/kramerius-api.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-periodical-years-item',
  templateUrl: './periodical-years-item.component.html',
  styleUrls: ['./periodical-years-item.component.scss']
})
export class PeriodicalYearsItemComponent implements OnInit {
  @Input() item: PeriodicalItem;

  constructor() { }

  ngOnInit() {
  }


}

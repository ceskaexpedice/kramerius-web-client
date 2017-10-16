import { PeriodicalItem } from './../../../model/periodicalItem.model';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-periodical-years-layout',
  templateUrl: './periodical-years-layout.component.html',
  styleUrls: ['./periodical-years-layout.component.scss']
})
export class PeriodicalYearsLayoutComponent implements OnInit {
  @Input() items: PeriodicalItem[];
  @Input() min: number;
  @Input() max: number;
  yearItems: PeriodicalItem[] = [];


  constructor() { }

  ngOnInit() {
    this.calcYearItems();
  }

  calcYearItems() {
    console.log("calcYearItems");
    console.log("calcYearItems max", this.max);

    console.log("calcYearItems min", this.min);

    if ((this.max - this.min + 1) > this.items.length) {
      for (let i = this.min; i <= this.max; i++) {
        let item: PeriodicalItem;
        for (let j = 0; j < this.items.length; j++) {
          if (this.items[j].title === String(i)) {
            item = this.items[j];
            break;
          }
        }
        if (!item) {
          item = new PeriodicalItem();
          item.title = String(i);
          item.doctype = 'periodicalvolume';
        }
        this.yearItems.push(item);
      }
    } else {
      this.yearItems = this.items;
    }
  }

}

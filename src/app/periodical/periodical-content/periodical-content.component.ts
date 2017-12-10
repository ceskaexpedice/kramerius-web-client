import { ActivatedRoute } from '@angular/router';
import { PeriodicalItem } from './../../model/periodicalItem.model';
import { Metadata } from './../../model/metadata.model';
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-periodical-content',
  templateUrl: './periodical-content.component.html',
  styleUrls: ['./periodical-content.component.scss']
})
export class PeriodicalContentComponent implements OnInit, OnChanges {

  @Input() metadata: Metadata;
  @Input() items: PeriodicalItem[];
  @Input() doctype: string;
  @Input() minYear: string;
  @Input() maxYear: string;


  gridLayoutEnabled = false;
  calendarLayoutEnabled = false;
  yearsLayoutEnabled = false;

  activeLayout = 'years';

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
   if (changes['doctype']) {
     this.init();
   }
  }

  init() {
    this.gridLayoutEnabled = true;
    this.calendarLayoutEnabled = false;
    this.yearsLayoutEnabled = false;
    if (this.doctype === 'periodical') {
      this.activeLayout = 'years';
      this.yearsLayoutEnabled = true;
    } else {
      this.activeLayout = 'calendar';
      this.calendarLayoutEnabled = true;
    }
  }

  onLayoutSelected(layout: string) {
    this.activeLayout = layout;
  }

}

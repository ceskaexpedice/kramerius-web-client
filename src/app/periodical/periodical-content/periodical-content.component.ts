import { PeriodicalItem } from './../../model/periodicalItem.model';
import { Metadata } from './../../model/metadata.model';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-periodical-content',
  templateUrl: './periodical-content.component.html',
  styleUrls: ['./periodical-content.component.scss']
})
export class PeriodicalContentComponent implements OnInit {

  @Input() metadata: Metadata;
  @Input() items: PeriodicalItem[];
  @Input() doctype: string;

  activeLayout = 'years';

  constructor() {
  }

  ngOnInit() {
    if (this.doctype === 'periodical') {
      this.activeLayout = 'years';
    } else {
      this.activeLayout = 'calendar';
    }
  }

  onLayoutSelected(layout: string) {
    this.activeLayout = layout;
  }

}

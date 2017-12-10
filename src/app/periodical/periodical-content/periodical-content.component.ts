import { PeriodicalService } from './../../services/periodical.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-periodical-content',
  templateUrl: './periodical-content.component.html'
})
export class PeriodicalContentComponent implements OnInit {

  constructor(public periodicalService: PeriodicalService) {
  }

  ngOnInit() {
  }

}

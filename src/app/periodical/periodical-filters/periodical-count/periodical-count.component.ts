import { PeriodicalService } from './../../../services/periodical.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-periodical-count',
  templateUrl: './periodical-count.component.html',
  styleUrls: ['./periodical-count.component.scss']

})
export class PeriodicalCountComponent implements OnInit {

  constructor(public periodicalService: PeriodicalService) { }

  ngOnInit() {
  }

}

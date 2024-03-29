import { PeriodicalService } from './../../../services/periodical.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-periodical-fulltext-layout',
  templateUrl: './periodical-fulltext-layout.component.html',
  styleUrls: ['./periodical-fulltext-layout.component.scss']
})
export class PeriodicalFulltextLayoutComponent implements OnInit {
    displayRows: boolean = false;

  constructor(public periodicalService: PeriodicalService) { }

  ngOnInit() {
  }

}

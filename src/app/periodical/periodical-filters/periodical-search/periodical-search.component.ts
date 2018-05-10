import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { PeriodicalService } from './../../../services/periodical.service';

@Component({
  selector: 'app-periodical-search',
  templateUrl: './periodical-search.component.html'
})
export class PeriodicalSearchComponent implements OnInit {

  query: string;

  constructor(public periodicalService: PeriodicalService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(queryParams => {
      const text = queryParams.get('fulltext');
      this.query = text;
    });
  }

  onKeyUp(event) {
    if (event.keyCode === 13) {
      this.changeQuery();
    }
  }

  changeQuery() {
    this.periodicalService.changeSearchQuery(this.query);
  }

  cleanQuery() {
    this.periodicalService.changeSearchQuery(null);
  }

}

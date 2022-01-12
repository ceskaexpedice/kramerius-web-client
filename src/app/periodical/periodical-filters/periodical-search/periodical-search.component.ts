import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { PeriodicalService } from './../../../services/periodical.service';
import { AnalyticsService } from '../../../services/analytics.service';

@Component({
  selector: 'app-periodical-search',
  templateUrl: './periodical-search.component.html',
  styleUrls: ['./periodical-search.component.scss']
})
export class PeriodicalSearchComponent implements OnInit {

  query: string;

  constructor(public periodicalService: PeriodicalService,
              public analytics: AnalyticsService,
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
      this.analytics.sendEvent('search phrase', 'periodical-by-return', this.query);
      this.changeQuery();
    }
  }

  onMagnifyIconClick() {
    this.analytics.sendEvent('search phrase', 'periodical-by-icon', this.query);
    this.changeQuery();
  }

  changeQuery() {
    this.periodicalService.changeSearchQuery(this.query);
  }

  cleanQuery() {
    this.query = null;
    this.analytics.sendEvent('periodical', 'cancel search');
    this.periodicalService.changeSearchQuery(null);
  }

}

import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PeriodicalService } from '../services/periodical.service';
import { PeriodicalQuery } from './periodical_query.model';

@Component({
  selector: 'app-periodical',
  templateUrl: './periodical.component.html'
})
export class PeriodicalComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute,
    public periodicalService: PeriodicalService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const uuid = params.get('uuid');
      this.route.queryParamMap.subscribe(queryParams => {
        this.periodicalService.init(PeriodicalQuery.fromParams(uuid, queryParams));
      });
    });
  }

  ngOnDestroy(): void {
    this.periodicalService.clear();
  }

}

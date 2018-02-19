import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PeriodicalService } from '../services/periodical.service';

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
        const fulltext = queryParams.get('fulltext');
        const page = queryParams.get('page');
        const accessibility = queryParams.get('accessibility');
        this.periodicalService.init(uuid, fulltext, parseInt(page, 10), accessibility);
      });
    });
  }

  ngOnDestroy(): void {
    this.periodicalService.clear();
  }

}

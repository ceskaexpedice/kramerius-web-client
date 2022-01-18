import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PeriodicalService } from '../services/periodical.service';
import { PeriodicalQuery } from './periodical_query.model';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-periodical',
  templateUrl: './periodical.component.html',
  styleUrls: ['./periodical.component.scss']

})
export class PeriodicalComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute,
    public periodicalService: PeriodicalService) { }

  ngOnInit() {
    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(
      results => {
        const uuid = results[0].get('uuid');
        this.periodicalService.init(PeriodicalQuery.fromParams(uuid, results[1]));
    });
  }

  ngOnDestroy(): void {
    this.periodicalService.clear();


  }

}

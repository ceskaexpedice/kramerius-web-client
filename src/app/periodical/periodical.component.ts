import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PeriodicalService } from '../services/periodical.service';
import { PeriodicalQuery } from './periodical_query.model';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';

@Component({
  selector: 'app-periodical',
  templateUrl: './periodical.component.html'
})
export class PeriodicalComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute,
    public periodicalService: PeriodicalService) { }

  ngOnInit() {
    Observable.combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(
      results => {
        const uuid = results[0].get('uuid');
        this.periodicalService.init(PeriodicalQuery.fromParams(uuid, results[1]));
    });
  }

  ngOnDestroy(): void {
    this.periodicalService.clear();


  }

}

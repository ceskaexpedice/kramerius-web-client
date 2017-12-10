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
      this.periodicalService.init(uuid);
    });
  }

  ngOnDestroy(): void {
    this.periodicalService.clear();
  }

}

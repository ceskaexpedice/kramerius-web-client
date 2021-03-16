import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-signpost-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class SignpostFooterComponent implements OnInit {

  constructor(public analytics: AnalyticsService) {
  }

  ngOnInit() {
  }

}

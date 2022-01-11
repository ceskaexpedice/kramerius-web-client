import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { BrowseService } from './../../services/browse.service';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-browse-search',
  templateUrl: './browse-search.component.html',
  styleUrls: ['./browse-search.component.scss']
})
export class BrowseSearchComponent implements OnInit {

  query: string;

  constructor(public browseService: BrowseService,
              public analytics: AnalyticsService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(queryParams => {
      const text = queryParams.get('bq');
      this.query = text;
      this.browseService.getText();
    });
  }

  onKeyUp(event) {
    if (event.keyCode === 13) {
      this.analytics.sendEvent('search phrase', 'browse-by-return', this.query);
      this.onBrowseQueryChanged();
    }
    event.stopPropagation();
  }

  onMagnifyIconClick() {
    this.analytics.sendEvent('search phrase', 'browse-by-icon', this.query);
    this.onBrowseQueryChanged();
  }


  onBrowseQueryChanged() {
   this.browseService.setText(this.query);
  }

  cleanQuery() {
    this.analytics.sendEvent('browse', 'cancel search');
    this.query = '';
    this.browseService.setText(this.query);
  }
}

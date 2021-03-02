import { AppSettings } from './../../services/app-settings';
import { BrowseService } from './../../services/browse.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-browse-results',
  templateUrl: './browse-results.component.html'
})
export class BrowseResultsComponent implements OnInit {

  constructor(public browseService: BrowseService, public appSettings: AppSettings) {
  }

  ngOnInit() {
  }

  getParams(value: string) {
    const params = {};
    params[this.browseService.query.category] = value;
    return params;
  }

}

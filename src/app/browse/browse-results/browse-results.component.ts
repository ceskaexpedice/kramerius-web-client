import { BrowseService } from './../../services/browse.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-browse-results',
  templateUrl: './browse-results.component.html'
})
export class BrowseResultsComponent implements OnInit {

  constructor(public browseService: BrowseService) {
  }

  ngOnInit() {
  }

  getParams(value: string) {
    const params = {};
    params[this.browseService.query.category] = value;
    return params;
  }

}

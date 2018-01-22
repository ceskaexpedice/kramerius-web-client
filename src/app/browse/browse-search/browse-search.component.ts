import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { BrowseService } from './../../services/browse.service';

@Component({
  selector: 'app-browse-search',
  templateUrl: './browse-search.component.html'
})
export class BrowseSearchComponent implements OnInit {

  query: string;

  constructor(public browseService: BrowseService, 
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(queryParams => {
      const text = queryParams.get('bq');
      this.query = text;
      this.browseService.getText(); // pedro
    });
  }

  onBrowseQueryChanged() {
   this.browseService.setText(this.query);
  }

  // pedro
  cleanQuery() {
    this.query = '';
    this.browseService.setText(this.query);
  }

  // // hide filters - pedro
  // hideFilters() {
  //   // this.state.filtersToggle();
  //   this.state.panelToggle();
  // }

}

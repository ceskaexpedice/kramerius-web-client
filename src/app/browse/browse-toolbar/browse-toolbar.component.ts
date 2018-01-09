import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { BrowseService } from './../../services/browse.service';

@Component({
  selector: 'app-browse-toolbar',
  templateUrl: './browse-toolbar.component.html',
  styleUrls: ['./browse-toolbar.component.scss']
})
export class BrowseToolbarComponent implements OnInit {

  query: string;

  constructor(public browseService: BrowseService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(queryParams => {
      const text = queryParams.get('bq');
      this.query = text;
    });
  }

  onBrowseQueryChanged() {
   this.browseService.setText(this.query);
  }
  
  cleanQuery() {
    this.query = '';
    this.browseService.setText(this.query);
  }
}

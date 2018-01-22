import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { BrowseService } from './../../services/browse.service';
import { AppState } from './../../app.state';

@Component({
  selector: 'app-browse-toolbar',
  templateUrl: './browse-toolbar.component.html',
  styleUrls: ['./browse-toolbar.component.scss']
})
export class BrowseToolbarComponent implements OnInit {

  query: string;

  constructor(public browseService: BrowseService, 
              private route: ActivatedRoute,
              public state: AppState) {
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
  
  // hide filters - pedro
  hidePanel() {
    this.state.panelToggleBrowse();
  }
}

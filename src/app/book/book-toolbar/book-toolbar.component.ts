import { Component, OnInit } from '@angular/core';
import { AppState } from './../../app.state';

@Component({
  selector: 'app-book-toolbar',
  templateUrl: './book-toolbar.component.html',
  styleUrls: ['./book-toolbar.component.scss']
})
export class BookToolbarComponent implements OnInit {

  constructor(public state: AppState) { }

  ngOnInit() {
  }
  
  // hide panel navigation
  hidePanelNavigation() {
    //this.state.panelToggleViewerNavigation();
    this.state.showingPanelViewerMetadata = true;
    this.state.showingPanelViewerNavigation = false;
  }
  
  // hide panel metadata
  hidePanelMetadata() {
    //this.state.panelToggleViewerMetadata();
    this.state.showingPanelViewerNavigation = true;
    this.state.showingPanelViewerMetadata = false;
  }
  
  // hide panel all
  hidePanelAll() {
    this.state.showingPanelViewerNavigation = true;
    this.state.showingPanelViewerMetadata = true;
  }
}

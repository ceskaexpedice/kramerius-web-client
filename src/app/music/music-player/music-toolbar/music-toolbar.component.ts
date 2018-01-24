import { Component, OnInit } from '@angular/core';
import { AppState } from './../../../app.state';

@Component({
  selector: 'app-music-toolbar',
  templateUrl: './music-toolbar.component.html',
  styleUrls: ['./music-toolbar.component.scss']
})
export class MusicToolbarComponent implements OnInit {

  constructor(public state: AppState) { }

  ngOnInit() {
  }

  // hide panel metadata
  hidePanelMetadata() {
    this.state.showingPanelMusic = false;
  }
  
  // hide panel all
  hidePanelAll() {
    this.state.showingPanelMusic = true;
  }
  
}

import { MusicService } from './../../../services/music.service';
import { Component, OnInit } from '@angular/core';
import { AppState } from './../../../app.state';

@Component({
  selector: 'app-music-toolbar',
  templateUrl: './music-toolbar.component.html'
})
export class MusicToolbarComponent implements OnInit {

  constructor(public musicService: MusicService) { }

  ngOnInit() {
  }

}

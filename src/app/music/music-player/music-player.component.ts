import { MusicService } from './../../services/music.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-music-player',
  templateUrl: './music-player.component.html'
})
export class MusicPlayerComponent implements OnInit {

  constructor(public musicService: MusicService) { }

  ngOnInit() {
  }

}

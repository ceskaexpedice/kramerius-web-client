import { MusicService } from './../../services/music.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-music-player',
  templateUrl: './music-player.component.html',
  styleUrls: ['./music-player.component.scss']
})
export class MusicPlayerComponent implements OnInit {

  constructor(public musicService: MusicService) { }

  ngOnInit() {
  }

}

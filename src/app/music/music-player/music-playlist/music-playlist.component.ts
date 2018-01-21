import { MusicService } from './../../../services/music.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-music-playlist',
  templateUrl: './music-playlist.component.html'
})
export class MusicPlaylistComponent implements OnInit {

  constructor(public musicService: MusicService) {

   }

  ngOnInit() {
  }



}

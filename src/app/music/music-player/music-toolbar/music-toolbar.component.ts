import { MusicService } from './../../../services/music.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-music-toolbar',
  templateUrl: './music-toolbar.component.html',
  styleUrls: ['./music-toolbar.component.scss']
})
export class MusicToolbarComponent implements OnInit {

  constructor(public musicService: MusicService) { }

  ngOnInit() {
  }

}

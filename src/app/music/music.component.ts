import { ActivatedRoute } from '@angular/router';
import { Metadata } from './../model/metadata.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MusicService } from '../services/music.service';
import { AppState } from './../app.state';

@Component({
  selector: 'app-music',
  templateUrl: './music.component.html'
})
export class MusicComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute,
      public musicService: MusicService) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const uuid = params.get('uuid');
      this.musicService.init(uuid);
    });
  }

  ngOnDestroy(): void {
    this.musicService.clear();
  }

}

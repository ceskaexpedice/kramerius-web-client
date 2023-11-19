import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MusicService } from '../services/music.service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-music',
  templateUrl: './music.component.html',
  styleUrls: ['./music.component.scss']
})
export class MusicComponent implements OnInit, OnDestroy {

  constructor(private route: ActivatedRoute,
      public musicService: MusicService) {
  }

  ngOnInit() {
    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(
      results => {
        const p = results[0];
        const q = results[1];
        const uuid = p.get('uuid');
        const track = q.get('track');
        this.musicService.init(uuid, track);
      }
    );
  }

  ngOnDestroy(): void {
    this.musicService.clear();
  }

}

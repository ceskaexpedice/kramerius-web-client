import { MusicService } from './../../../services/music.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AnalyticsService } from '../../../services/analytics.service';

@Component({
  selector: 'app-music-controls',
  templateUrl: './music-controls.component.html',
  styleUrls: ['./music-controls.component.scss']
})
export class MusicControlsComponent implements OnInit {

  @ViewChild('trackSlider') trackSlider: ElementRef;

  @ViewChild('progressContainer', { static: true }) progressContainer: any;

  constructor(public musicService: MusicService,
    public analytics: AnalyticsService) { }

  play() {
    this.analytics.sendEvent('music', 'play');
    this.musicService.playTrack();
  }

  pause() {
    this.analytics.sendEvent('music', 'pause');
    this.musicService.pauseTrack();
  }

  ngOnInit() {
  }

  soundUnitImage() {
    return this.musicService.getSoundUnitImageUrl();
  }

  onProgressClick(event: any) {
    const width = this.progressContainer.nativeElement.clientWidth;
    const point = event.clientX;
    const p = point / width;
    this.musicService.changeProgress(p);
  }

}

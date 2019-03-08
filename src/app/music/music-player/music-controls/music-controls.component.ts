import { DomSanitizer } from '@angular/platform-browser';
import { MusicService } from './../../../services/music.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AnalyticsService } from '../../../services/analytics.service';

@Component({
  selector: 'app-music-controls',
  templateUrl: './music-controls.component.html'
})
export class MusicControlsComponent implements OnInit {

  @ViewChild('trackSlider') trackSlider: ElementRef;


  constructor(public musicService: MusicService,
    public analytics: AnalyticsService,
    private _sanitizer: DomSanitizer) { }



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
    return this._sanitizer.bypassSecurityTrustStyle('url("' + this.musicService.getSoundUnitImageUrl() + '")');
  }

  trackSliderChanged() {
    this.musicService.changeTrackPosition(this.trackSlider.nativeElement.value);
  }

}

import { DomSanitizer } from '@angular/platform-browser';
import { MusicService } from './../../../services/music.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-music-controls',
  templateUrl: './music-controls.component.html'
})
export class MusicControlsComponent implements OnInit {

  @ViewChild('trackSlider') trackSlider: ElementRef;


  constructor(public musicService: MusicService,
    private _sanitizer: DomSanitizer) { }


  ngOnInit() {
  }

  soundUnitImage() {
    return this._sanitizer.bypassSecurityTrustStyle('url("' + this.musicService.getSoundUnitImageUrl() + '")');
  }

  trackSliderChanged() {
    this.musicService.changeTrackPosition(this.trackSlider.nativeElement.value);
  }

}

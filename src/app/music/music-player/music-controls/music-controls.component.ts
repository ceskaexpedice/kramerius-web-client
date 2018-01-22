import { DomSanitizer } from '@angular/platform-browser';
import { MusicService } from './../../../services/music.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-music-controls',
  templateUrl: './music-controls.component.html'
})
export class MusicControlsComponent implements OnInit {

  constructor(public musicService: MusicService,
    private _sanitizer: DomSanitizer) { }

  ngOnInit() {
  }

  soundUnitImage() {
    return this._sanitizer.bypassSecurityTrustStyle('url("' + this.musicService.getSoundUnitImageUrl() + '")');
  }

}

import { DomSanitizer } from '@angular/platform-browser';
import { MusicService } from './../../../services/music.service';
import { Component, OnInit } from '@angular/core';
import { KrameriusApiService } from '../../../services/kramerius-api.service';

@Component({
  selector: 'app-music-header',
  templateUrl: './music-header.component.html'
})
export class MusicHeaderComponent implements OnInit {

  constructor(public musicService: MusicService,
              private _sanitizer: DomSanitizer) { }

  ngOnInit() {
  }

  coverImage() {
    return this._sanitizer.bypassSecurityTrustStyle('url("' + this.musicService.getCoverImageUrl() + '")');
  }

}

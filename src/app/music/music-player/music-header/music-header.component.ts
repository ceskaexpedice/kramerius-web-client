import { DomSanitizer } from '@angular/platform-browser';
import { MusicService } from './../../../services/music.service';
import { Component, OnInit } from '@angular/core';
import { KrameriusApiService } from '../../../services/kramerius-api.service';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery';

@Component({
  selector: 'app-music-header',
  templateUrl: './music-header.component.html'
})
export class MusicHeaderComponent implements OnInit {

  galleryOptions: NgxGalleryOptions[];

  constructor(public musicService: MusicService,
              private _sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.galleryOptions = [
      { 'previewCloseOnClick': true, 'previewCloseOnEsc': true, 'thumbnails': false, 'width': '150px', 'height': '150px',
        'arrowPrevIcon':  'fa fa-chevron-left',
        'arrowNextIcon':  'fa fa-chevron-right',
        'closeIcon':  'fa fa-times'}
    ];
  }

}

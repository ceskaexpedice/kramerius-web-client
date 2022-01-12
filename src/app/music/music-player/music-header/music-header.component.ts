import { MusicService } from './../../../services/music.service';
import { Component, OnInit } from '@angular/core';
import { NgxGalleryOptions } from 'ngx-gallery';

@Component({
  selector: 'app-music-header',
  templateUrl: './music-header.component.html',
  styleUrls: ['./music-header.component.scss']
})
export class MusicHeaderComponent implements OnInit {

  galleryOptions: NgxGalleryOptions[];

  constructor(public musicService: MusicService) { }

  ngOnInit() {
    this.galleryOptions = [
      { 'previewCloseOnClick': true, 'previewCloseOnEsc': true, 'thumbnails': false, 'width': '250px', 'height': '250px',
        'arrowPrevIcon':  'fa fa-chevron-left',
        'arrowNextIcon':  'fa fa-chevron-right',
        'closeIcon':  'fa fa-times'}
    ];
  }

}

import { MusicService } from './../../../services/music.service';
import { Component, OnInit } from '@angular/core';
import { NgxGalleryAnimation, NgxGalleryOptions } from '@kolkov/ngx-gallery';

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
      {
        width: '200px',
        height: '200px',
        thumbnails: false,
        arrowPrevIcon: 'fa fa-chevron-left',
        arrowNextIcon: 'fa fa-chevron-right',
        imageAnimation: NgxGalleryAnimation.Slide,
      }
    ];

  }
}

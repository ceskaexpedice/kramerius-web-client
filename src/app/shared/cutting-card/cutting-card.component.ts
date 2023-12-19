import { Component, OnInit, Input } from '@angular/core';
import { Cutting } from '../../model/cutting';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-cutting-card',
  templateUrl: './cutting-card.component.html',
  styleUrls: ['./cutting-card.component.scss']
})
export class CuttingCardComponent implements OnInit {

  @Input() item: Cutting;

  constructor( private _sanitizer: DomSanitizer) {
  }

  ngOnInit() {
  }

  getThumb() {
    return this._sanitizer.bypassSecurityTrustStyle(`url(${this.item.thumb})`);
  }


}

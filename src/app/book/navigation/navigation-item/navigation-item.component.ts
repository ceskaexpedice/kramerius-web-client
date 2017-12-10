import { Page } from './../../../model/page.model';
import { KrameriusApiService } from './../../../services/kramerius-api.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Element } from '@angular/compiler';

@Component({
  selector: 'app-navigation-item',
  templateUrl: './navigation-item.component.html'
})
export class NavigationItemComponent implements OnInit {
  @Input() page: Page;
  @Input() container;
  @Output() pageSelected = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
  }

  onPageClicked() {
    this.pageSelected.emit();
  }

}

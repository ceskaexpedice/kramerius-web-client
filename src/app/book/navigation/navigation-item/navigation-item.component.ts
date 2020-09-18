import { Page } from './../../../model/page.model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AppSettings } from './../../../services/app-settings';

@Component({
  selector: 'app-navigation-item',
  templateUrl: './navigation-item.component.html'
})
export class NavigationItemComponent implements OnInit {
  @Input() page: Page;
  @Input() container;
  @Output() pageSelected = new EventEmitter();

  constructor(public settings: AppSettings) {
  }

  ngOnInit() {
  }

  onPageClicked() {
    this.pageSelected.emit();
  }

}

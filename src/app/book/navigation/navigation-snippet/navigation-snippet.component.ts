import { Page } from './../../../model/page.model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AppSettings } from '../../../services/app-settings';

@Component({
  selector: 'app-navigation-snippet',
  templateUrl: './navigation-snippet.component.html'
})
export class NavigationSnippetComponent implements OnInit {
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

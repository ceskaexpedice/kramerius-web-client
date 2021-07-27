import { Page } from './../../../model/page.model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AppSettings } from '../../../services/app-settings';
import { LicenceService } from '../../../services/licence.service';

@Component({
  selector: 'app-navigation-item',
  templateUrl: './navigation-item.component.html'
})
export class NavigationItemComponent implements OnInit {
  @Input() page: Page;
  @Input() container;
  @Output() pageSelected = new EventEmitter();

  constructor(public settings: AppSettings, private licences: LicenceService) {
  }

  ngOnInit() {
  }

  onPageClicked() {
    this.pageSelected.emit();
  }

  private getLockClass() {
    if (this.page.public || this.settings.hiddenLocks) {
      return "";
    } else {
      return this.licences.buildLock(this.page.licences).class;
    }
  }

}

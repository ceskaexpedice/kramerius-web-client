import { Page } from './../../../model/page.model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AppSettings } from '../../../services/app-settings';
import { LicenceService } from '../../../services/licence.service';

@Component({
  selector: 'app-navigation-item',
  templateUrl: './navigation-item.component.html',
  styleUrls: ['./navigation-item.component.scss']

})
export class NavigationItemComponent implements OnInit {
  @Input() page: Page;
  @Input() container;
  @Output() pageSelected = new EventEmitter();
  lock: any;

  constructor(public settings: AppSettings, private licences: LicenceService) {
  }

  ngOnInit() {
    if (this.page.public || this.settings.hiddenLocks) {
      this.lock = null;
    } else {
      this.lock = this.licences.buildLock(this.page.licences);
    }
  }

  onPageClicked() {
    this.pageSelected.emit();
  }

}

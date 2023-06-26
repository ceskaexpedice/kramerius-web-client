import { Page } from './../../../model/page.model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AppSettings } from '../../../services/app-settings';
import { LicenceService } from '../../../services/licence.service';

@Component({
  selector: 'app-navigation-snippet',
  templateUrl: './navigation-snippet.component.html',
  styleUrls: ['./navigation-snippet.component.scss']
})
export class NavigationSnippetComponent implements OnInit {
  @Input() page: Page;
  @Input() container;
  @Output() pageSelected = new EventEmitter();
  lock: any;

  constructor(public settings: AppSettings, private licences: LicenceService) {
  }

  ngOnInit() {
    this.lock = this.licences.buildLock(this.page.licences, this.page.public);
  }

  onPageClicked() {
    this.pageSelected.emit();
  }

}

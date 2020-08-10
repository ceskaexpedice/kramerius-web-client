import { AccountService } from './../services/account.service';
import { DialogCitationComponent } from './../dialog/dialog-citation/dialog-citation.component';
import { DialogAuthosComponent } from './../dialog/dialog-authors/dialog-authors.component';
import { AppSettings } from './../services/app-settings';
import { Metadata } from './../model/metadata.model';
import { Component, OnInit, Input } from '@angular/core';
import { MzModalService } from 'ngx-materialize';
import { AnalyticsService } from '../services/analytics.service';
import { DialogShareComponent } from '../dialog/dialog-share/dialog-share.component';
import { DialogAdminMetadataComponent } from '../dialog/dialog-admin-metadata/dialog-admin-metadata.component';
import { DialogPolicyComponent } from '../dialog/dialog-policy/dialog-policy.component';

@Component({
  selector: 'app-metadata',
  templateUrl: './metadata.component.html'
})
export class MetadataComponent implements OnInit {
  public controlsEnabled = true;

  @Input() set showControls(value: boolean) {
    this.controlsEnabled = value;
  }
  @Input() metadata: Metadata;
  showingTitle = false;

  constructor(private modalService: MzModalService,
              public analytics: AnalyticsService,
              public account: AccountService,
              public settings: AppSettings) { }

  ngOnInit() {
  }

  showTitle() {
    this.showingTitle = !this.showingTitle;
  }

  showMetadata() {
    return this.show(this.settings.showMetadata);
  }

  showSharing() {
    return this.show(this.settings.showSharing);
  }

  showCitation() {
    return this.show(this.settings.showCitation);
  }

  // openInProarc() {
  //   window.open(this.metadata.proarcLink(), '_blank');
  // }

  onShowAuthors() {
    this.analytics.sendEvent('metadata', 'authors');
    this.modalService.open(DialogAuthosComponent, { authors: this.metadata.authors} );
  }

  onShowPolicyPrivateDialog() {
    this.modalService.open(DialogPolicyComponent, { type: 'private' } );
  }

  onShowPolicyDnntDialog() {
    this.modalService.open(DialogPolicyComponent, { type: 'dnnt' } );
  }

  onShowCitation() {
    this.analytics.sendEvent('metadata', 'citation');
    this.modalService.open(DialogCitationComponent, { metadata: this.metadata });
  }

  onShare() {
    this.analytics.sendEvent('metadata', 'share');
    this.modalService.open(DialogShareComponent, { metadata: this.metadata });
  }

  onShowMetadata() {
    this.analytics.sendEvent('metadata', 'admin-metadata');
    this.modalService.open(DialogAdminMetadataComponent, { metadata: this.metadata } );
  }


  private show(value: string): boolean {
    return value === 'allways' || (value === 'public' && this.metadata.isPublic);
  }

}

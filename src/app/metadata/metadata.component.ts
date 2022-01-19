import { AppSettings } from './../services/app-settings';
import { Metadata } from './../model/metadata.model';
import { Component, OnInit, Input } from '@angular/core';
import { AnalyticsService } from '../services/analytics.service';
import { AdminDialogComponent } from '../dialog/admin-dialog/admin-dialog.component';
import { AuthService } from '../services/auth.service';
import { LicenceService } from '../services/licence.service';
import { BookService } from '../services/book.service';
import { ShareDialogComponent } from '../dialog/share-dialog/share-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthorsDialogComponent } from '../dialog/authors-dialog/authors-dialog.component';
import { CitationDialogComponent } from '../dialog/citation-dialog/citation-dialog.component';
import { MetadataDialogComponent } from '../dialog/metadata-dialog/metadata-dialog.component';
import { LicenceDialogComponent } from '../dialog/licence-dialog/licence-dialog.component';

@Component({
  selector: 'app-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.scss']
})
export class MetadataComponent implements OnInit {
  public controlsEnabled = true;

  @Input() set showControls(value: boolean) {
    this.controlsEnabled = value;
  }
  @Input() metadata: Metadata;
  showingTitle = false;

  expand = {}

  constructor(public analytics: AnalyticsService,
              private dialog: MatDialog,
              public bookService: BookService,
              public licences: LicenceService,
              public auth: AuthService,
              public settings: AppSettings) { }

  ngOnInit() {
  }

  toHtml(text: string): string {
    if (!text) {
      return "";
    }
    const html = text.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    return html;
  }

  showTitle() {
    this.showingTitle = !this.showingTitle;
  }

  showMetadata() {
    return this.show('metadata');
  }

  showSharing() {
    return this.show('share');
  }

  showCitation() {
    return this.show('citation');
  }

  openAdminActions() {
    this.dialog.open(AdminDialogComponent, { data: { metadata: this.metadata }, autoFocus: false });
  }

  onShowAuthors() {
    this.analytics.sendEvent('metadata', 'authors');
    this.dialog.open(AuthorsDialogComponent, { data: { authors: this.metadata.authors }, autoFocus: false });
  }

  anyLicence(): boolean {
    return this.licences.availableLicences(this.metadata.licences).length > 0;
  }

  showPrivateDialog() {
    this.analytics.sendEvent('metadata', 'private-dialog');
    this.dialog.open(LicenceDialogComponent, { data: { licences: this.metadata.licences, full: true }, autoFocus: false });
  }

  showLicenceDialog() {
    this.analytics.sendEvent('metadata', 'licence-dialog');
    this.dialog.open(LicenceDialogComponent, { data: { licences: [this.metadata.licence], full: false }, autoFocus: false });
  }

  onShowCitation() {
    this.analytics.sendEvent('metadata', 'citation');
    this.dialog.open(CitationDialogComponent, { data: { metadata: this.metadata }, autoFocus: false });
  }

  onShare() {
    this.analytics.sendEvent('metadata', 'share');
      let opts = { metadata: this.metadata };
      this.dialog.open(ShareDialogComponent, { data: opts, autoFocus: false });
  }

  onShowMetadata() {
    this.analytics.sendEvent('metadata', 'admin-metadata');
    this.dialog.open(MetadataDialogComponent, { data: { metadata: this.metadata }, autoFocus: false });
  }

  private show(action: string): boolean {
    if (this.metadata.licence) {
      const l = this.licences.action(this.metadata.licence, action);
      if (l == 1) {
        return true;
      } else if (l == 2) {
        return false;
      }
    }
    const value = this.settings.actions[action];
    return value === 'always' || (value=="available" && !this.bookService.isPageInaccessible()) || (value === 'public' && this.metadata.isPublic);
  }

}

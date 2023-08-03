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
import { FolderService } from '../services/folder.service';

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
  expandedTitle = false;

  expand = {}

  constructor(public analytics: AnalyticsService,
              private dialog: MatDialog,
              public bookService: BookService,
              public licences: LicenceService,
              public auth: AuthService,
              public settings: AppSettings,
              public folderService: FolderService) { }

  ngOnInit() {
    console.log('metadata', this.metadata);
  }

  toHtml(text: string): string {
    if (!text) {
      return "";
    }
    const html =  text.replace(/\\\[/g, '__RRR__')
                      .replace(/\\\)/g, '__PPP__')
                      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
                      .replace(/__RRR__/g, '\[')
                      .replace(/__PPP__/g, '\)')
                      .replace(/(?:\r\n|\r|\n)/g, '<br>');
    return html;
  }


  expendableTitle(): boolean {
    return this.metadata.getTitle().length > 75 || this.metadata.titles.length > 1;
  }

  toggleExpandedTitle() {
    this.expandedTitle = !this.expandedTitle;
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
    if (!this.actionEnabled('citation')) {
      return;
    }
    this.analytics.sendEvent('metadata', 'citation');
    this.dialog.open(CitationDialogComponent, { data: { metadata: this.metadata }, autoFocus: false });
  }

  onShare() {
    if (!this.actionEnabled('share')) {
      return;
    }
    this.analytics.sendEvent('metadata', 'share');
    let opts = { metadata: this.metadata };
    this.dialog.open(ShareDialogComponent, { data: opts, autoFocus: false });
  }
  onLike() {
    this.folderService.like(this.metadata.uuid);
  }

  onShowMetadata() {
    if (!this.actionEnabled('metadata')) {
      return;
    }
    this.analytics.sendEvent('metadata', 'admin-metadata');
    this.dialog.open(MetadataDialogComponent, { data: { metadata: this.metadata }, autoFocus: false });
  }

  actionEnabled(action: string): boolean {
    if (this.metadata.licence) {
      const l = this.licences.action(this.metadata.licence, action);
      if (l == 1) {
        return true;
      } else if (l == 2) {
        return false;
      }
    }    
    const value = this.settings.actions[action];
    return value === 'always' || (value === 'public' && this.metadata.isPublic);
  }

  actionAvailable(action: string): boolean {
    return this.settings.actions[action] != 'never';
  }

  // PARSE COORDINATES
  calcCoordinate(d: number, m: number, s: number): number {
    return d + m/60 + s/3600;
  }

  coordinate(x: string, d: string, m: string, s: string): number {
    let c = this.calcCoordinate(parseInt(d), parseInt(m), parseInt(s));
    if (x == 'W' || x == 'z' || x == 'S' || x == 'j') {
      c = -1*c;
    }
    return c;
  }

  parseType1(coordinates: string): { e: number, w: number, n: number, s: number } | undefined {
    const re = "^\\((\\d{1,3})°(\\d{1,2})\´(\\d{1,2})\"\\s([v,z]{1})\.d\.--(\\d{1,3})°(\\d{1,2})\´(\\d{1,2})\"\\s([v,z]{1})\.d\.\/(\\d{1,3})°(\\d{1,2})\´(\\d{1,2})\"\\s([s,j]{1})\.š\.--(\\d{1,3})°(\\d{1,2})\´(\\d{1,2})\"\\s([s,j]{1})\.š\.\\)$";
    const c = coordinates.match(re);
    if (c == null) {
      return undefined;
    }
    return {
      w: this.coordinate(c[4], c[1], c[2], c[3]),
      e: this.coordinate(c[8], c[5], c[6], c[7]),
      n: this.coordinate(c[12], c[9], c[10], c[11]),
      s: this.coordinate(c[16], c[13], c[14], c[15])
    };
  }

  parseType2(coordinates: string): { e: number, w: number, n: number, s: number } | undefined {
    const re = "^\\(([E,W]{1})\\s(\\d{1,3})°(\\d{1,2})'(\\d{1,2})\"--([E,W]{1})\\s(\\d{1,3})°(\\d{1,2})'(\\d{1,2})\"\/([S,N]{1})\\s(\\d{1,3})°(\\d{1,2})'(\\d{1,2})\"--([S,N]{1})\\s(\\d{1,3})°(\\d{1,2})'(\\d{1,2})\"\\)$";
    const c = coordinates.match(re);
    if (c == null) {
      return undefined;
    }
    return {
      w: this.coordinate(c[1], c[2], c[3], c[4]),
      e: this.coordinate(c[5], c[6], c[7], c[8]),
      n: this.coordinate(c[9], c[10], c[11], c[12]),
      s: this.coordinate(c[13], c[14], c[15], c[16])
    };
  }

  parseBoundingBox (coordinates: string): { e: number, w: number, n: number, s: number } | undefined {
    let bb = this.parseType1(coordinates);
    if (!bb) {
      bb = this.parseType2(coordinates);
    }
    console.log(bb)
    return bb;
  }

  displayCoordinates(coordinates: any) {
    const parsedCoordinates = this.parseBoundingBox(coordinates)
    if (parsedCoordinates.e === parsedCoordinates.w && parsedCoordinates.n == parsedCoordinates.s) {
      return [parsedCoordinates.n.toFixed(5) + ', ' + parsedCoordinates.e.toFixed(5)]
    } else {
      return [parsedCoordinates.n.toFixed(5) + ', ' + parsedCoordinates.e.toFixed(5), parsedCoordinates.s.toFixed(5) + ', ' + parsedCoordinates.w.toFixed(5)]
    }
  }

}

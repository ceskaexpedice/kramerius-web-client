import { ShareService } from './../services/share.service';
import { DialogAuthosComponent } from './../dialog/dialog-authors/dialog-authors.component';
import { AppSettings } from './../services/app-settings';
import { Metadata } from './../model/metadata.model';
import { Component, OnInit, Input } from '@angular/core';
import { MzModalService } from 'ngx-materialize';
import { DialogMetadataComponent } from '../dialog/dialog-metadata/dialog-metadata.component';
import { CitationService } from '../services/citation.service';
import { AnalyticsService } from '../services/analytics.service';

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
              private citationService: CitationService,
              private shareService: ShareService,
              public analytics: AnalyticsService,
              public appSettings: AppSettings) { }

  ngOnInit() {
  }

  showTitle() {
    this.showingTitle = !this.showingTitle;
  }

  showModsDialog() {
    this.analytics.sendEvent('metadata', 'mods');
    this.modalService.open(DialogMetadataComponent, { map: this.metadata.modsMap} );
  }

  showAuthors() {
    this.analytics.sendEvent('metadata', 'authors');
    this.modalService.open(DialogAuthosComponent, { authors: this.metadata.authors} );
  }

  showCitation() {
    this.analytics.sendEvent('metadata', 'citation');
    this.citationService.showCitation(this.metadata);
  }

  onShare() {
    this.analytics.sendEvent('metadata', 'share');
    this.shareService.showShareDialog();
  }

}

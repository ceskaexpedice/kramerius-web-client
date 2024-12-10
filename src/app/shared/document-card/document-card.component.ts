import { AppSettings } from './../../services/app-settings';
import { DocumentItem } from './../../model/document_item.model';
import { KrameriusApiService } from './../../services/kramerius-api.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';
import { LicenceService } from '../../services/licence.service';
import { TranslateService } from '@ngx-translate/core';
import { FolderService } from '../../services/folder.service';
import { Folder } from '../../model/folder.model';
import { MatLegacyMenuTrigger as MatMenuTrigger } from '@angular/material/legacy-menu';
import { MatDialog } from '@angular/material/dialog';
import { DisplayMetadataDialogComponent } from '../../dialog/display-metadata-dialog/display-metadata-dialog.component';
import { Metadata } from '../../model/metadata.model';
import { SearchService } from '../../services/search.service';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-document-card',
  templateUrl: './document-card.component.html',
  styleUrls: ['./document-card.component.scss']
})
export class DocumentCardComponent implements OnInit {
  @Input() item: DocumentItem;
  @Input() in: string;
  @Input() selectable: boolean = false;
  @Input() folder: Folder;
  @ViewChild(MatMenuTrigger,{static:false}) menu: MatMenuTrigger; 
  @Output() open = new EventEmitter();

  thumb;
  lock: any;
  legacyLocks: boolean;
  metadataSubscription: any;
  metadata: Metadata;

  constructor(private krameriusApiService: KrameriusApiService,
              private settings: AppSettings,
              private translate: TranslateService,
              public auth: AuthService,
              private licences: LicenceService,
              private analytics: AnalyticsService,
              private _sanitizer: DomSanitizer,
              public folderService: FolderService,
              private dialog: MatDialog,
              private ui: UiService) { }

  ngOnInit() {
    this.init();
  }

  onOpen() {
    this.analytics.sendEvent(this.in, 'document', this.item.title)
    this.open.emit();
  }

  onLike(folder: Folder) {
    this.folderService.like(folder, this.item.uuid);
    this.openSnackBar(folder.name);
    // console.log('onLike', folder, this.item.uuid);
  }
  checkFolders() {
    if (!this.folderService.folders) {
      this.folderService.getFolders(null);
    }
  }
  
  openSnackBar(name: string) {
    const message = <string> this.translate.instant('folders.liked') + ' ' + name;
    this.ui.showStringSuccess(message);
  }
  onDislike(folder: Folder) {
    this.folderService.dislike(folder, this.item.uuid);
    this. folder.items = this.folder.items.filter(item => item.uuid !== this.item.uuid);
    // console.log('onDislike', this.folder.items);
  }
  onNewFolder(name: string) {
    this.menu.closeMenu();
    // console.log('onNewFolder', name);
    this.folderService.addFolderAndItem(name, this.item.uuid);
  }

  getTitle() {
    if ((this.in === 'folder-owner' || this.in === 'folder-follower' || this.in === 'collection' ) && (this.item.doctype === 'periodicalitem' || this.item.doctype === 'periodicalvolume')) {
      // console.log('item', this.item);
      // return this.item.root_title.split(':')[0] + ' ' + this.item.title;
      return this.item.root_title;
    } else {
      return this.item.getTitle ? this.item.getTitle(this.translate.currentLang) : this.item.title;
    }
  }

  getDescription() {
    return this.item.getDescription ? this.item.getDescription(this.translate.currentLang) : this.item.description;
  }

  libraryLogo(): string {
    return this.settings.getLogoByCode(this.item.library);
  }

  sourceLogo(source: string): string {
    return `https://registr.digitalniknihovna.cz/libraries/${source}/logo`;
  }

  getMetadata(uuid: string) {
    this.metadataSubscription = this.krameriusApiService.getMetadata(uuid).subscribe(metadata => {
      this.metadata = metadata
      this.metadata.doctype = this.item.doctype;
      this.metadata.addToContext(this.item.doctype, this.item.uuid);
      this.metadata.assignDocument(this.item);
      const dialogRef = this.dialog.open(DisplayMetadataDialogComponent, {
        data: {
          title: 'Metadata',
          metadata: metadata,
          button: 'folders.dialogs.open',
          confirm: 'confirm'},
        autoFocus: false,
        maxWidth: '100vw',
      });
    });
  }

  private init() {
    let url = '';
    if (this.item.library) {
      const krameriusUrl = this.settings.getUrlByCode(this.item.library);
      url = this.krameriusApiService.getThumbUrlForKramerius(this.item.uuid, krameriusUrl);
    } else {
       url = this.krameriusApiService.getThumbUrl(this.item.uuid);
    }
    this.lock = this.licences.buildLock(this.item.licences, this.item.public);
    this.legacyLocks = this.settings.legacyLocks;
    this.thumb = this._sanitizer.bypassSecurityTrustStyle(`url(${url})`);
  }
}

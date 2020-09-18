import { KrameriusApiService } from '../../services/kramerius-api.service';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { DocumentItem } from './../../model/document_item.model';
import { MzBaseModal, MzModalComponent } from 'ngx-materialize';
import { saveAs } from 'file-saver';
import { Translator } from 'angular-translator';
import { KrameriusInfoService } from '../../services/kramerius-info.service';
import { first } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { Page } from '../../model/page.model';
import { AppSettings } from './../../services/app-settings';
import { HttpClient } from '@angular/common/http';
//const fileExists = require('file-exists');


@Component({
  selector: 'app-dialog-pdf-generator',
  templateUrl: './dialog-pdf-generator.component.html',
  styleUrls: ['./dialog-pdf-generator.component.scss']
})
export class DialogPdfGeneratorComponent extends MzBaseModal implements OnInit {
  @ViewChild('modal') modal: MzModalComponent;
  @Input() pageCount: number;
  @Input() currentPage: number;
  @Input() doublePage: boolean;
  @Input() pages: Page[];
  @Input() type: string;
  @Input() name: string;
  @Input() uuid: string;
  @Input() item: DocumentItem;

  maxPageCount: number;

  inProgress: boolean;

  selection = {};

  lastIndex = -1;
  lastState = false;

  messageId = 'tip_shift';
  errorId = null;

  numberOfPages = 0;

  pdfDownload: boolean;
  pdfDownloadLink: string;
  pdfDownloadMB: number;
  json;
  url: string[];

  constructor(private krameriusApi: KrameriusApiService,
              public appSettings: AppSettings,
              private http: HttpClient,
              private krameriusInfo: KrameriusInfoService,
              private _sanitizer: DomSanitizer,
              private translator: Translator) {
    super();
  }


  ngOnInit(): void {
    this.inProgress = true;
    this.krameriusInfo.data$.pipe(first()).subscribe(
      info => {
        this.maxPageCount = info.pdfMaxRange;
        this.inProgress = false;
      },
      error => {
        this.maxPageCount = 30;
        this.inProgress = false;
      }
    );

    this.pdfDownloadLink =this.appSettings.pdfUrl+this.uuid;

      this.http.get(this.pdfDownloadLink).toPromise().then((data:any) => {
          console.log(data);
          //console.log(data.json.pdf);
          if(data.pdf=="true") {this.pdfDownload=true;}
          this.pdfDownloadMB=data.size;
        });

    this.pdfDownloadLink=this.pdfDownloadLink+"&pdf=true";

  }

  onPageSelected(page: Page, event) {
    if (event.shiftKey && this.lastIndex > -1) {
      let index = Math.min(this.lastIndex, page.index);
      const i2 = Math.max(this.lastIndex, page.index);
      while (index <= i2) {
        this.selection[this.pages[index].uuid] = this.lastState;
        index += 1;
      }
      this.lastIndex = page.index;
    } else {
      this.lastState = !this.selection[page.uuid];
      this.lastIndex = page.index;
      this.selection[page.uuid] = this.lastState;
    }



    const uuids = [];
    for (const page of this.pages) {
      if (this.selection[page.uuid]) {
        uuids.push(page.uuid);
      }
    }
    this.numberOfPages = uuids.length;
    this.messageId = 'info_pages';
  }

  thumb(page: Page) {
    return this._sanitizer.bypassSecurityTrustStyle(`url(${page.thumb})`);
  }


  action() {
    this.errorId = null;
    this.messageId = null;
    const uuids = [];
    for (const page of this.pages) {
      if (this.selection[page.uuid]) {
        uuids.push(page.uuid);
      }
    }
    this.numberOfPages = uuids.length;
    if (this.numberOfPages > this.maxPageCount) {
      this.errorId = 'warning_too_manny_pages';
      return;
    } else if (this.numberOfPages === 0) {
      this.errorId = 'warning_no_page';
      return;
    }
    if (this.type === 'prepare') {
      this.prepareToPrint(uuids);
    } else if (this.type === 'generate') {
      this.generatePdf(uuids);
    }
  }

  generatePdf(uuids: string[]) {
    this.errorId = null;
    this.messageId = 'warning_generate';
    this.inProgress = true;
    this.krameriusApi.downloadPdf(uuids, this.getLanguage()).subscribe(
      blob => {
        saveAs(blob, this.name + '.pdf');
        this.inProgress = false;
        this.messageId = null;
        this.modal.closeModal();
      },
      error => {
        this.inProgress = false;
        this.messageId = null;
        this.errorId = 'error_generate';
      }
    );
  }

  prepareToPrint(uuids: string[]) {
    window.open(this.krameriusApi.getLocalPrintUrl(uuids), '_blank');
    this.modal.closeModal();
  }



  private getLanguage(): string {
    return this.translator.language === 'cs' ? 'cs' : 'en';
  }

}

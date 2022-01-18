
import { Component, OnInit, Inject } from '@angular/core';
import { first } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Page } from '../../model/page.model';
import { KrameriusApiService } from '../../services/kramerius-api.service';
import { KrameriusInfoService } from '../../services/kramerius-info.service';
import { DomSanitizer } from '@angular/platform-browser';
import { saveAs } from 'file-saver';
import { TranslateService } from '@ngx-translate/core';

@Component({
  templateUrl: './pdf-dialog.component.html',
  styleUrls: ['./pdf-dialog.component.scss']
})
export class PdfDialogComponent implements OnInit {

  pageCount: number;
  currentPage: number;
  doublePage: boolean;
  pages: Page[];
  type: string;
  name: string;

  maxPageCount: number;
  inProgress: boolean;
  selection = {};
  lastIndex = -1;
  lastState = false;
  messageId = 'tip_shift';
  errorId = null;
  numberOfPages = 0;
  selectedPages = 0;

  constructor(
            public dialogRef: MatDialogRef<PdfDialogComponent>,
            private krameriusApi: KrameriusApiService,
            private krameriusInfo: KrameriusInfoService,
            private _sanitizer: DomSanitizer,
            private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) private data: any) { }



  ngOnInit(): void {
    this.pageCount = this.data['pageCount'];
    this.currentPage = this.data['currentPage'];
    this.doublePage = this.data['doublePage'];
    this.pages = this.data['pages'];
    this.type = this.data['type'];
    this.name = this.data['name'];
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
    let count = 0;
    for (const key in this.selection) {
      if (this.selection[key]) {
        count += 1;
      }
    }
    this.setNumberOfSelectedPages(count);
  }

  selectAll() {
    for (const page of this.pages) {
      this.selection[page.uuid] = true;
    }
    this.setNumberOfSelectedPages(this.pageCount);
  }

  deselectAll() {
    for (const key in this.selection) {
      this.selection[key] = false;
    }
    this.setNumberOfSelectedPages(0);
  }

  private setNumberOfSelectedPages(count: number) {
    this.selectedPages = count;
    if (this.selectedPages > this.maxPageCount) {
      this.errorId = 'warning_too_manny_pages';
    } else {
      this.errorId = null;
    }
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
        this.dialogRef.close();
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
    this.dialogRef.close();
  }

  private getLanguage(): string {
    return this.translate.currentLang === 'cs' ? 'cs' : 'en';
  }
  
  onCancel() {
    this.dialogRef.close();
  }

}

import { KrameriusApiService } from './../../services/kramerius-api.service';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MzBaseModal, MzModalComponent } from 'ngx-materialize';
import { saveAs } from 'file-saver';
import { Translator } from 'angular-translator';
import { KrameriusInfoService } from '../../services/kramerius-info.service';

@Component({
  selector: 'app-dialog-pdf',
  templateUrl: './dialog-pdf.component.html'
})
export class DialogPdfComponent extends MzBaseModal implements OnInit {
  @ViewChild('modal') modal: MzModalComponent;
  @Input() pageCount: number;
  @Input() currentPage: number;
  @Input() doublePage: boolean;
  @Input() uuids: string[];
  @Input() type: string;
  @Input() name: string;

  maxPageCount: number;

  pageFrom: number;
  pageTo: number;

  inProgress: boolean;
  showWarningMessage: boolean;
  downloadError: boolean;


  constructor(private krameriusApi: KrameriusApiService, private krameriusInfo: KrameriusInfoService, private translator: Translator) {
    super();
  }

  ngOnInit(): void {
    this.inProgress = true;
    this.showWarningMessage = false;
    this.pageFrom = this.currentPage + 1;
    this.pageTo = this.pageFrom;
    this.downloadError = false;
    if (this.doublePage) {
      this.pageTo += 1;
    }
    const subscription = this.krameriusInfo.data$.subscribe(
      info => {
        this.maxPageCount = info.pdfMaxRange;
        this.inProgress = false;
        subscription.unsubscribe();
      },
      error => {
        this.maxPageCount = 30;
        this.inProgress = false;
        subscription.unsubscribe();
      }
    );
  }

  onFromValueChanged() {
    if (this.pageFrom < 1) {
      this.pageFrom = 1;
    } else if (this.pageFrom > this.pageTo) {
      this.pageFrom = this.pageTo;
    }
  }

  onToValueChanged() {
    if (this.pageTo > this.pageCount) {
      this.pageTo = this.pageCount;
    } else if (this.pageTo < this.pageFrom) {
      this.pageTo = this.pageFrom;
    }
  }

  isValid() {
    if (this.pageFrom < 1 || this.pageTo > this.pageCount || this.pageTo - this.pageFrom < 0 || this.selectedPages() > this.maxPageCount) {
      return false;
    }
    return true;
  }

  selectedPages(): number {
    const number = this.pageTo - this.pageFrom + 1;
    if (this.pageFrom < 1 || this.pageTo > this.pageCount || number < 1) {
      return 0;
    } else {
      return number;
    }
  }

  action() {
    if (!this.isValid()) {
      return;
    }
    const uuids = this.uuids.slice(this.pageFrom - 1, this.pageTo);
    if (this.type === 'prepare') {
      this.prepareToPrint(uuids);
    } else if (this.type === 'generate') {
      this.generatePdf(uuids);
    }
  }

  generatePdf(uuids: string[]) {
    this.showWarningMessage = true;
    this.inProgress = true;
    this.downloadError = false;
    this.krameriusApi.downloadPdf(uuids, this.getLanguage()).subscribe(
      blob => {
        saveAs(blob, this.name + '.pdf');
        this.inProgress = false;
        this.showWarningMessage = false;
        this.modal.closeModal();
      },
      error => {
        this.downloadError = true;
        this.showWarningMessage = false;
        this.inProgress = false;
      }
    );
  }

  prepareToPrint(uuids: string[]) {
    window.open(this.krameriusApi.getLocalPrintUrl(uuids), '_blank');
    this.modal.closeModal();
  }



  private getLanguage(): string {
    return this.translator.language;
  }

}

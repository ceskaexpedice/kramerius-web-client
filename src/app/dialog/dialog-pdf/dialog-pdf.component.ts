import { KrameriusApiService } from './../../services/kramerius-api.service';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MzBaseModal, MzModalComponent } from 'ngx-materialize';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-dialog-pdf',
  templateUrl: './dialog-pdf.component.html'
})
export class DialogPdfComponent extends MzBaseModal implements OnInit {
  @ViewChild('modal') modal: MzModalComponent;
  @Input() pageCount: number;
  @Input() currentPage: number;
  @Input() doublePage: boolean;
  @Input() maxPageCount: number;
  @Input() uuids: string[];
  @Input() type: string;

  pageFrom: number;
  pageTo: number;

  inProgress = false;

  constructor(private krameriusApi: KrameriusApiService) {
    super();
  }

  ngOnInit(): void {
    this.pageFrom = this.currentPage + 1;
    this.pageTo = this.pageFrom;
    if (this.doublePage) {
      this.pageTo += 1;
    }
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
    this.inProgress = true;
    this.krameriusApi.downloadPdef(uuids).subscribe(
      response => {
        const contentDispositionHeader: string = response.headers.get('Content-Disposition');
        const blob = new Blob([response['_body']], { type: 'application/pdf' });
        saveAs(blob, 'document.pdf');
        this.inProgress = false;
        this.modal.closeModal();
      }
    );
  }

  prepareToPrint(uuids: string[]) {
    window.open(this.krameriusApi.getLocalPrintUrl(uuids), '_blank');
    this.modal.closeModal();
  }


}

import { BookService } from '../../services/book.service';
import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ViewerActions, ViewerControlsService } from '../../services/viewer-controls.service';
import { AppSettings } from '../../services/app-settings';
import { KrameriusInfoService } from '../../services/kramerius-info.service';
import { interval, Subscription } from 'rxjs';
import { PdfService } from '../../services/pdf.service';
import { PDFDocumentProxy, PdfViewerComponent } from 'ng2-pdf-viewer';
import { LicenceService } from '../../services/licence.service';
import { AuthService } from '../../services/auth.service';
import { TtsService } from '../../services/tts.service';
import { AiService } from '../../services/ai.service';

@Component({
  selector: 'app-pdf-viewer2',
  templateUrl: './pdf-viewer2.component.html',
  styleUrls: ['./pdf-viewer2.component.scss']
})
export class PdfViewer2Component implements  OnInit, OnDestroy {

  private viewerActionsSubscription: Subscription;
  private intervalSubscription: Subscription;
  rotation: number = 0;
  zoomScale = 'page-fit';


  public hideOnInactivity = false;
  public lastMouseMove = 0;

  @ViewChild(PdfViewerComponent) private pdfComponent: PdfViewerComponent;

  constructor(public bookService: BookService, 
              public settings: AppSettings,
              public pdf: PdfService,
              public tts: TtsService,
              public authService: AuthService,
              public licences: LicenceService,
              public krameriusInfo: KrameriusInfoService,
              private ai: AiService,
              public controlsService: ViewerControlsService) {
    (window as any).pdfWorkerSrc = '/assets/js/pdf.worker.min.js';
  }

  ngOnInit() {
    this.viewerActionsSubscription = this.controlsService.viewerActions().subscribe((action: ViewerActions) => {
      this.onActionPerformed(action);
    });
    this.intervalSubscription = interval(4000).subscribe( () => {
      const lastMouseDist = new Date().getTime() - this.lastMouseMove;
      if (lastMouseDist >= 4000) {
        this.hideOnInactivity = true;
      }
    });  
  }


  ngOnDestroy() {
    this.tts.stop();
    if (this.viewerActionsSubscription) {
      this.viewerActionsSubscription.unsubscribe();
    }    
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }

  }

  afterLoadComplete(pdfData: PDFDocumentProxy) {
    this.pdf.init(pdfData, this.pdfComponent);
    this.rotation = 0;
    this.pdf.zoom = 1;
    this.pdf.pdfLoading = false;
    this.bookService.onPdfSuccess();
  }

  showPageActions(): boolean {
    return !this.bookService.serviceLoading && !this.pdf.pdfLoading && this.aiActionsAvailable();
  }

  aiActionsAvailable(): boolean {
    return this.ai.aiAvailable();
  }

  onPageOcr() {
    this.bookService.showOcr();
  }

  onReadPage() {
    this.bookService.readPdfPage();
  }

  onTranslatePage() {
    this.bookService.translatePdfPage();
  }

  onSummarizePage() {
    this.bookService.summarizePdfPage();
  }

  pageRendered(e) {
    // this.thumbnails.push({
    //     page: e.pageNumber,
    //     url: e.source.canvas.toDataURL()
    // });
    // console.log('thumbnails', this.thumbnails);
  }

  onPageChange(e) {
    this.bookService.goToPdfPageOnIndex(e)
  }

  onError(error: any) {
    this.pdf.pdfLoading = false;
    if (error && error.status == 403) {
      this.bookService.onPdfInaccessible();
    } else {
      this.bookService.onPdfFilure();
    }
  }

  onMouseMove() {
    this.lastMouseMove = new Date().getTime();
    this.hideOnInactivity = false;
  }

  private onActionPerformed(action: ViewerActions) {
    switch (action) {
      case ViewerActions.zoomIn:
        this.pdf.zoomIn();
        break;
      case ViewerActions.zoomOut:
        this.pdf.zoomOut();
        break;
      case ViewerActions.rotateRight:
       this.rotation = this.rotation + 90 % 360;
        break;
      // case ViewerActions.updateSite:
      //   this.updateSize();
      //   break;
      case ViewerActions.fitToScreen:
        this.pdf.zoom = 1;
        this.zoomScale = 'page-fit';
        break;
    }
  }

  today() {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return day + '.' + month + '.' + year;
  }

}

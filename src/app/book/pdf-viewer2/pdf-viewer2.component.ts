import { BookService } from '../../services/book.service';
import { Component, OnInit } from '@angular/core';
import { ViewerActions, ViewerControlsService } from '../../services/viewer-controls.service';
import { AppSettings } from '../../services/app-settings';
import { KrameriusInfoService } from '../../services/kramerius-info.service';
import { interval, Subscription } from 'rxjs';
import { PdfService } from '../../services/pdf.service';

@Component({
  selector: 'app-pdf-viewer2',
  templateUrl: './pdf-viewer2.component.html'
})
export class PdfViewer2Component implements  OnInit {

  private viewerActionsSubscription: Subscription;
  private intervalSubscription: Subscription;
  pdfLoading: boolean;
  rotation: number = 0;
  zoom: number = 1;
  zoomScale = 'page-fit';

  public hideOnInactivity = false;
  public lastMouseMove = 0;

  constructor(public bookService: BookService, 
              public settings: AppSettings,
              public pdfService: PdfService,
              public krameriusInfo: KrameriusInfoService,
              public controlsService: ViewerControlsService) {
  }

  ngOnInit() {
    this.pdfLoading = true;
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
    if (this.viewerActionsSubscription) {
      this.viewerActionsSubscription.unsubscribe();
    }    
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  afterLoadComplete(pdfData: any) {
    console.log('afterLoadComplete', pdfData);
    this.pdfService.init(pdfData.numPages);
    this.rotation = 0;
    this.zoom = 1;
    this.pdfLoading = false;
  }

  pageRendered(e) {
    // this.thumbnails.push({
    //     page: e.pageNumber,
    //     url: e.source.canvas.toDataURL()
    // });
    // console.log('thumbnails', this.thumbnails);
  }

  onError(error: any) {
    console.log('error', error);
  }

  onMouseMove() {
    this.lastMouseMove = new Date().getTime();
    this.hideOnInactivity = false;
  }

  private onActionPerformed(action: ViewerActions) {
    switch (action) {
      case ViewerActions.zoomIn:
        this.zoom += 0.2;
        break;
      case ViewerActions.zoomOut:
        this.zoom -= 0.2;
        break;
      case ViewerActions.rotateRight:
       this.rotation = this.rotation + 90 % 360;
        break;
      // case ViewerActions.updateSite:
      //   this.updateSize();
      //   break;
      case ViewerActions.fitToScreen:
        this.zoom = 1;
        this.zoomScale = 'page-fit';
        break;
    }
  }

}

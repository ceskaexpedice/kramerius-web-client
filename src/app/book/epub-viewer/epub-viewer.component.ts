import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularEpubViewerComponent } from 'angular-epub-viewer';
import { ViewChild } from '@angular/core';
import { EpubService } from '../../services/epub.service';
import { interval, Subscription } from 'rxjs';
import { ViewerControlsService } from '../../services/viewer-controls.service';

@Component({
  selector: 'app-epub-viewer',
  templateUrl: './epub-viewer.component.html'
})
export class EpubViewerComponent implements  OnInit, OnDestroy {

  @ViewChild('epubViewer') epubViewer: AngularEpubViewerComponent;

  public hideOnInactivity = false;
  public lastMouseMove = 0;
  private intervalSubscription: Subscription;

  constructor(public epub: EpubService, public controlsService: ViewerControlsService) {
  }

  ngOnInit() {
    this.epub.init(this.epubViewer);

    this.epubViewer.openLink('/assets/shared/zivot_proti_smrti.epub');

    this.intervalSubscription = interval(4000).subscribe( () => {
      const lastMouseDist = new Date().getTime() - this.lastMouseMove;
      if (lastMouseDist >= 4000) {
        this.hideOnInactivity = true;
      }
    });  

    // setInterval(_ => {
    //   if (document.activeElement.tagName == "IFRAME") {
    //     console.log('------ iframe took a focus');
    //     (document.activeElement as HTMLElement).blur();
    // epubjs-iframe:ee52aded-3404-4623-dde8-eb5bd9bcbde1
    //   }
    // }, 500);
  }

  // ngAfterViewInit() {
  //   this.epubViewer.epub.on('renderer:click', (event) => {

  // }

  onDocumentReady(event) {
    this.epubViewer.epub.on('renderer:click', (event) => {
      this.onMouseMove();
    });
    this.epubViewer.epub.on('renderer:keydown', (event) => {
      // console.log('--------keydown', event);
      if (!event) {
          return;
      }
      if (event.which == 37) {
          this.epub.goToPrevious();
      }
      if (event.which == 39) {
          this.epub.goToNext();
      }
    });
  }

  ngOnDestroy() { 
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  onMouseMove() {
    this.lastMouseMove = new Date().getTime();
    this.hideOnInactivity = false;
  }

  // onMetadataLoaded(metadata: any) {
  //   console.log('onMetadataLoaded', metadata);
  // }


}

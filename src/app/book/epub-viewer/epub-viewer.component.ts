import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularEpubViewerComponent } from 'angular-epub-viewer';
import { ViewChild } from '@angular/core';
import { EpubService } from '../../services/epub.service';
import { interval, Subscription } from 'rxjs';
import { ViewerActions, ViewerControlsService } from '../../services/viewer-controls.service';
import { BookService } from '../../services/book.service';
import { Author, Metadata, Publisher, TitleInfo } from '../../model/metadata.model';

@Component({
  selector: 'app-epub-viewer',
  templateUrl: './epub-viewer.component.html',
  styleUrls: ['./epub-viewer.component.scss']
})
export class EpubViewerComponent implements  OnInit, OnDestroy {

  @ViewChild('epubViewer', { static: true }) epubViewer: AngularEpubViewerComponent;

  private viewerActionsSubscription: Subscription;

  public hideOnInactivity = false;
  public lastMouseMove = 0;
  private intervalSubscription: Subscription;

  constructor(public epub: EpubService, 
    public controlsService: ViewerControlsService, 
    public bookService: BookService) {
  }

  ngOnInit() {
    this.epub.init(this.epubViewer);
    this.intervalSubscription = interval(4000).subscribe( () => {
      const lastMouseDist = new Date().getTime() - this.lastMouseMove;
      if (lastMouseDist >= 4000) {
        this.hideOnInactivity = true;
      }
    });  

    this.viewerActionsSubscription = this.controlsService.viewerActions().subscribe((action: ViewerActions) => {
      this.onActionPerformed(action);
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

  private onActionPerformed(action: ViewerActions) {
    switch (action) {
      case ViewerActions.zoomIn:
        this.epub.zoomIn();
        break;
      case ViewerActions.zoomOut:
        this.epub.zoomOut();
        break;
    }
  }

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
    this.epubViewer.epub.setGap(50);
    this.epub.init(this.epubViewer);
  }

  ngOnDestroy() { 
    if (this.viewerActionsSubscription) {
      this.viewerActionsSubscription.unsubscribe();
    }    
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  onMouseMove() {
    this.lastMouseMove = new Date().getTime();
    this.hideOnInactivity = false;
  }

  onMetadataLoaded(metadata: any) {
    const m = new Metadata();


    const titleInfo = new TitleInfo();
    titleInfo.nonSort = "";
    titleInfo.title = metadata.bookTitle;
    titleInfo.subTitle = "";
    titleInfo.partNumber = "";
    titleInfo.partName  = "";
    m.titles = [titleInfo];

    if (metadata.creator) {
      const author = new Author();
      author.type = "";
      author.name = metadata.creator;
      author.usage = "";
      author.date = "";
      author.primary = true;
      m.authors = [author];
    }
    
    if (metadata.language) {
      let lang = "";
      if (metadata.language) {
        if (metadata.language == 'ar-SA') {
          lang = "ara";
        } else if (metadata.language == 'cs' || metadata.language == 'cs-CZ' || metadata.language == 'cz') {
          lang = "cze";
        }
      }
      m.languages = [lang];
    }

    const publisher = new Publisher();
    publisher.name = metadata.publisher;
    if (metadata.pubdate.split("-").length == 3) {
      publisher.date = metadata.pubdate.split("-")[2].substring(0,2) + ". " + metadata.pubdate.split("-")[1] + ". " + metadata.pubdate.split("-")[0];
    } else {
      publisher.date = metadata.pubdate;
    }
    publisher.place = "";
    m.publishers = [publisher];

    if (metadata.description) {
      m.notes = [metadata.description]
    }

    if (metadata.identifier) {
      if (metadata.identifier.indexOf('ISBN') == 0) {
        m.identifiers = { 'isbn':  metadata.identifier.substring(4, metadata.identifier.length)}
      }
    }


    this.bookService.metadata = m;
  }


}



// bookTitle: "Život proti smrti"
// creator: "Marie Pujmanová"
// description: ""
// direction: null
// identifier: "urn:uuid:b3c73870-0821-429f-b9ec-950374386c83"
// language: "ar-SA"
// layout: ""
// modified_date: ""
// orientation: ""
// pubdate: "2018-10-09"
// publisher: "Městská knihovna v Praze"
// rights: ""
// spread: ""
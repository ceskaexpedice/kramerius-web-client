import { BookService } from '../../services/book.service';
import { Component, OnInit } from '@angular/core';
import { ViewerControlsService } from '../../services/viewer-controls.service';
import { AppSettings } from '../../services/app-settings';
import { KrameriusInfoService } from '../../services/kramerius-info.service';

@Component({
  selector: 'app-pdf-viewer2',
  templateUrl: './pdf-viewer2.component.html'
})
export class PdfViewer2Component implements  OnInit {


  constructor(public bookService: BookService, 
              public settings: AppSettings,
              public krameriusInfo: KrameriusInfoService,
              public controlsService: ViewerControlsService) {
  }

  ngOnInit() {
  }

}

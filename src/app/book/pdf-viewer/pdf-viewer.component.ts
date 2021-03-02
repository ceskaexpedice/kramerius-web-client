import { BookService } from './../../services/book.service';
import { Component, OnInit } from '@angular/core';
import { ViewerControlsService } from '../../services/viewer-controls.service';
import { AppSettings } from '../../services/app-settings';
import { KrameriusInfoService } from '../../services/kramerius-info.service';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html'
})
export class PdfViewerComponent implements  OnInit {


  constructor(public bookService: BookService, 
              public settings: AppSettings,
              public krameriusInfo: KrameriusInfoService,
              public controlsService: ViewerControlsService) {
  }

  ngOnInit() {
  }

}

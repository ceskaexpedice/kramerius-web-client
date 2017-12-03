import { Component, OnInit } from '@angular/core';
import { BrowseService } from './../../services/browse.service';

@Component({
  selector: 'app-browse-toolbar',
  templateUrl: './browse-toolbar.component.html',
  styleUrls: ['./browse-toolbar.component.scss']
})
export class BrowseToolbarComponent implements OnInit {

  constructor(public browseService: BrowseService) {
  }

  ngOnInit() {
  }

}

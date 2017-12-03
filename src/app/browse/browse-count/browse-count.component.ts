import { BrowseService } from './../../services/browse.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-browse-count',
  templateUrl: './browse-count.component.html',
  styleUrls: ['./browse-count.component.scss']
})
export class BrowseCountComponent implements OnInit {

  constructor(public browseService: BrowseService) {
  }

  ngOnInit() {
  }

}

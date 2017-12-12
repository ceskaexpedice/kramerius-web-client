import { Metadata } from './../model/metadata.model';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.scss']
})
export class MetadataComponent implements OnInit {
  @Input() metadata: Metadata;
  showingTitle: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  showTitle() {
    this.showingTitle = !this.showingTitle;
  }
}

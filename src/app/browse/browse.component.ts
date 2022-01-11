import { BrowseService } from './../services/browse.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../services/page-title.service';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private pageTitle: PageTitleService,
    public browseService: BrowseService) {
  }

  ngOnInit() {
    this.pageTitle.setTitle('browse', null);
    this.route.queryParams.subscribe(params => {
      this.browseService.init(params);
    });
  }

}

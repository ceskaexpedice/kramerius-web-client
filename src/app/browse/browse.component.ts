import { BrowseService } from './../services/browse.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html'
})
export class BrowseComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    public browseService: BrowseService) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.browseService.init(params);
    });
  }

}

import { BrowseService } from './../services/browse.service';
import { AppState } from './../app.state';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    public browseService: BrowseService,
    public state: AppState) { }


  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.browseService.init(params);
    });
  }

}

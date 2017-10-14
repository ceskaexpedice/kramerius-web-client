import { DocumentItem } from './../model/document_item.model';
import { KrameriusApiService } from './../services/kramerius-api.service';
import { Component, OnInit } from '@angular/core';
import { AppState } from '../app.state';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  newest: DocumentItem[];
  recommended: DocumentItem[];

  constructor(public state: AppState, private krameriusApiService: KrameriusApiService) {

  }

  ngOnInit() {
    $(document).ready(function(){
      $('ul.tabs').tabs();
    });
    $(document).ready(function(){
      $('.carousel').carousel();
    });
    this.getNewest();
    this.getRecommended();
  }

  getNewest() {
    this.krameriusApiService.getNewest().subscribe(response => {
      this.newest = response;
    });
  }

  getRecommended() {
    this.krameriusApiService.getRecommended().subscribe(response => {
      this.recommended = response;
    });
  }
}

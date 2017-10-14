import { Component, OnInit } from '@angular/core';
import { AppState } from '../app.state';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(public state: AppState) {
    
  }

  ngOnInit(){
    $(document).ready(function(){
      $('ul.tabs').tabs();
    });
  }

}

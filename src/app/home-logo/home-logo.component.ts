import { AppSettings } from './../services/app-settings';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-logo',
  templateUrl: './home-logo.component.html'
})
export class HomeLogoComponent implements OnInit {

  constructor(public appSettings: AppSettings) {
  }

  ngOnInit() {
  }

}

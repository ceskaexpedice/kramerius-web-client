import { AppSettings } from './../services/app-settings';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html'
})
export class LandingComponent implements OnInit {

  page = 'none';

  constructor(private appSettings: AppSettings, private router: Router) {
  }

  ngOnInit() {
    if (this.appSettings.multiKramerius) {
      if (this.appSettings.landingPage) {
        this.page = 'libraries';
      } else {
        const url = '/' + this.appSettings.code;
        this.router.navigateByUrl(url);
      }
    }  else {
        this.page = 'home';
    }
  }


}

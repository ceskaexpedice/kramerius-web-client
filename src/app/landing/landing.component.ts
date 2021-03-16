import { AppSettings } from './../services/app-settings';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html'
})
export class LandingComponent implements OnInit {

  page = 'none';

  constructor(private settings: AppSettings, private router: Router) {
  }

  ngOnInit() {
    if (this.settings.multiKramerius) {
      if (this.settings.landingPage) {
        this.page = 'signpost';
      } else {
        const url = '/' + this.settings.code;
        this.router.navigateByUrl(url);
      }
    }  else {
        this.page = 'home';
    }
  }


}

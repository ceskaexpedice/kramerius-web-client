import { AppSettings } from './../services/app-settings';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CrisisService } from '../services/crisis.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html'
})
export class LandingComponent implements OnInit {

  page = 'none';

  constructor(private appSettings: AppSettings, private router: Router, private crisis: CrisisService) {
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
      if (this.crisis.checkApproval('/')) {
        this.page = 'home';
      }
    }
  }


}

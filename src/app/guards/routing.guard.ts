import { AppSettings } from './../services/app-settings';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { CrisisService } from '../services/crisis.service';

@Injectable()

export class RoutingGuardService implements CanActivate {

  constructor(
      private router: Router,
      private appSettings: AppSettings, private crisis: CrisisService) {
  }

  canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): boolean {
          console.log("asdasd");
          if (this.appSettings.multiKramerius) {
            const url = '/' + this.appSettings.code + state.url;
            this.router.navigateByUrl(url);
            return false;
          } else {
             return this.crisis.checkApproval(state.url);
          }
  }
}

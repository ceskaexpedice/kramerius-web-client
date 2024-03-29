import { AppSettings } from './../services/app-settings';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable()

export class RoutingGuardService implements CanActivate {

  constructor(
      private router: Router,
      private appSettings: AppSettings) {
  }

  canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): boolean {
          if (this.appSettings.multiKramerius) {
            const code = this.appSettings.code || this.appSettings.krameriusList[0].code;
            const url = '/' + code + state.url;
            this.router.navigateByUrl(url);
            return false;
          } else {
             return true;
          }
  }
}

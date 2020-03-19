import { AppSettings } from './../services/app-settings';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { CrisisService } from '../services/crisis.service';

@Injectable()

export class RoutingPrefixGuardService implements CanActivate {

  constructor(
      private router: Router,
      private appSettings: AppSettings, private crisis: CrisisService) {
  }

  canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): boolean {
        const url = state.url.substring(1);
        let code = url;
        if (url.indexOf('/') > -1) {
          code = url.substring(0, url.indexOf('/'));
        }
        if (!this.appSettings.multiKramerius || !this.appSettings.assignKrameriusByCode(code)) {
          this.router.navigateByUrl('/404');
          return false;
        }
        if (url && url.indexOf('/') >= 0) {
          return this.crisis.checkApproval(state.url);
        } else {
          return true;
        }
    }
}

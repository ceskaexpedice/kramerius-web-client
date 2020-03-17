import { AppSettings } from './app-settings';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';


@Injectable()
export class CrisisService {


    constructor(private settings: AppSettings, private router: Router) {}


    checkApproval(url: string): boolean {
        if (this.settings.crisis && localStorage.getItem("crisis_approved") !== "yes") {
            localStorage.setItem("crisis_url", url);
            this.router.navigateByUrl('/podminky-zpristupneni');
            return false;
        };
        return true;
    }

    

}

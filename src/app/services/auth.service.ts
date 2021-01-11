import { KrameriusApiService } from './kramerius-api.service';
import { Injectable } from '@angular/core';
import { User } from '../model/user.model';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/shareReplay';
import 'rxjs/add/operator/do';
import { HttpRequestCache } from './http-request-cache.service';
import { AppSettings } from './app-settings';


@Injectable()
export class AuthService {

    user: User = null;
    redirectUrl: string;

    constructor(private appSettings: AppSettings, private krameriusApi: KrameriusApiService, private cache: HttpRequestCache) {
        if (appSettings.dnnt || appSettings.krameriusLogin) {
            this.login(null, null);
        }
    }

    login(username: string, password: string, callback: (user: User) => void = null) {
        return this.krameriusApi.getUserInfo(username, password).subscribe(user => {
            this.user = user;
            this.cache.clear();
            if (callback) {
                callback(user);
            }
        });
    }

    logout(callback: () => void = null) {
        if (!this.isLoggedIn()) {
            return;
        }
        return this.krameriusApi.logout().subscribe(user => {
            this.cache.clear();
            this.user = null;
            if (callback) {
                callback();
            }
        });
    }

    isLoggedIn(): boolean {
        // return true;
        return this.user && this.user.isLoggedIn();
    }

    getUserId(): string {
        if (!this.user) {
            return '';
        }
        return this.user.code;
    }
}

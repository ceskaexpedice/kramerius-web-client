import { KrameriusApiService } from './kramerius-api.service';
import { Injectable } from '@angular/core';
import { User } from '../model/user.model';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/shareReplay';
import 'rxjs/add/operator/do';
import { HttpRequestCache } from './http-request-cache.service';
import { AppSettings } from './app-settings';
import { LicenceService } from './licence.service';
import { LocalStorageService } from './local-storage.service';


@Injectable({
    providedIn: 'root'
})
export class AuthService {

    user: User = null;
    redirectUrl: string;

    constructor(private settings: AppSettings, private licences: LicenceService, private api: KrameriusApiService, private locals: LocalStorageService, private cache: HttpRequestCache) {
        if (!settings.multiKramerius && (settings.auth || settings.krameriusLogin || settings.k7)) {
            this.userInfo(null, null);
        }
        this.settings.kramerius$.subscribe(() =>  {
            if (settings.auth || settings.krameriusLogin || settings.k7) {
                this.userInfo(null, null);
            }
        });
    }

    login(username: string, password: string, callback: (status: string) => void = null) {
        if (this.settings.k7) {
            this.k7Login(username, password, callback);
        } else {
            this.userInfo(username, password, callback);
        }
    }

    userInfo(username: string, password: string, callback: (status: string) => void = null) {
        this.api.getUserInfo(username, password).subscribe(user => {
            this.user = user;
            // console.log('USER', this.user);
            // console.log('Licences', this.user.licences);
            this.licences.assignUserLicences(this.user.licences);
            this.cache.clear();
            if (callback) {
                callback('ok');
            }
        });
    }

    k7Login(username: string, password: string, callback: (status: string) => void = null) {
        this.api.auth(username, password).subscribe(
            (token: string) => {
                console.log('login ok', token);
                if (!token) {
                    callback('Přihlášení se nezdařilo');
                    return;
                }
                this.settings.setToken(token);
                this.userInfo(null, null, callback);
            },
            (error) => {
                if (error.status == 401) {
                    callback('Neplatné přihlašovací údaje');
                } else {
                    callback('Přihlášení se nezdařilo');
                }
            }
        );
    }

    logout(callback: () => void = null) {
        if (!this.isLoggedIn()) {
            return;
        }
        if (this.settings.k7) {
            this.settings.setToken('');
            this.api.logout().subscribe(user => {
                this.cache.clear();
                this.userInfo(null, null, callback);
            });
        } else {
            this.api.logout().subscribe(user => {
                this.cache.clear();
                this.userInfo(null, null, callback);
            });
        }
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

    getUserName(): string {
        if (!this.user) {
            return '';
        }
        return this.user.firstname;
    }

    isAdmin(): boolean {
        if (!this.settings.k7 || !this.isLoggedIn() || !this.user.roles) {
            return false;
        }
        for (const role of this.user.roles) {
            if (role['name'] == 'k4_admins' || role['name'] == 'kramerius_admin') {
                return true;
            }
        }
        return false;
    }
}

import { KrameriusApiService } from './kramerius-api.service';
import { Injectable } from '@angular/core';
import { User } from '../model/user.model';
import { HttpRequestCache } from './http-request-cache.service';
import { AppSettings } from './app-settings';
import { LicenceService } from './licence.service';
import { Subject, Observable } from 'rxjs';
import { FolderService } from './folder.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    user: User = null;
    redirectUrl: string;
    userSub = new Subject<User>();

    constructor(private settings: AppSettings, 
                private licences: LicenceService, 
                private api: KrameriusApiService, 
                private cache: HttpRequestCache) {
        if ((settings.auth || settings.krameriusLogin || settings.version >= 7) && !settings.multiKramerius) {
            this.userInfo(null, null);
        }
        this.settings.kramerius$.subscribe(() =>  {
            if (settings.auth || settings.krameriusLogin || settings.version >= 7) {
                this.userInfo(null, null);
            }
        });
    }

    baseUrl(): string {
        return location.origin + this.settings.deployPath;
    }

    k5login(username: string, password: string, callback: (status: string) => void = null) {
        this.userInfo(username, password, callback);
    }

    userInfo(username: string, password: string, callback: (status: string) => void = null) {
        this.api.getUserInfo(username, password).subscribe(user => {
            this.user = user;
            console.log('USER', this.user);
            this.userSub.next(this.user);
            // console.log('Licences', this.user.licences);
            this.licences.assignUserLicences(this.user.licences, this.user.authenticated);
            this.cache.clear();
            if (this.settings.keycloak) {
                this.api.getRights('uuid:1').subscribe(
                    (actions) => {
                        this.user.actions = actions || [];
                        // console.log('user', this.user);
                        if (callback) {
                            callback('ok');
                        }
                    },
                    (error) => {
                        if (callback) {
                            callback('ok');
                        }
                    }
                );
            } else {
                if (callback) {
                    callback('ok');
                }
            }
        }, (error) => {
            this.licences.assignUserLicences([], false);
            this.user = null;
            this.userSub.next(this.user);
            this.cache.clear();
        });
    }

    login() {
        const redirectUrl = `${this.baseUrl()}${this.settings.getRouteFor('keycloak')}`;
        const url = this.api.getK7LoginUrl(redirectUrl);
        window.open(url, '_top');
    }

    getToken(code: string, callback: (status: string) => void = null) {
        const redirectUri = `${this.baseUrl()}${this.settings.getRouteFor('keycloak')}`;
        this.api.getToken(code, redirectUri).subscribe(
            (token: string) => {
                console.log('auth ok', token);
                if (!token) {
                    console.log('emapty token');
                    return;
                }
                this.settings.setToken(token);
                this.userInfo(null, null, callback)
            },
            (error) => {
                console.log('error', error);
                const redirectUrl = this.baseUrl();
                const url = this.api.getK7LogoutUrl(redirectUrl);
                window.open(url, '_top');
            }
        );
    }

    logout(callback: () => void = null) {
        if (!this.isLoggedIn()) {
            return;
        }
        if (this.settings.keycloak) {
            this.cache.clear();
            this.settings.removeToken();
            const redirectUrl = `${this.baseUrl()}${this.settings.getRouteFor('keycloak')}`;
            const url = this.api.getK7LogoutUrl(redirectUrl);
            const path = this.settings.getRelativePath();
            localStorage.setItem('logout.url', path);
            window.open(url, '_top');
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
        return this.user.uid || this.user.eppn || '';
    }

    getUserName(): string {
        if (!this.user) {
            return '';
        }
        return this.user.name || this.user.uid || '';
    }

    isAdmin(): boolean {
        if (!this.settings.keycloak || !this.isLoggedIn()) {
            return false;
        }
        return this.user.actions.indexOf('a_admin_read') >= 0;
    }

    watchUser(): Observable<User> {
        console.log('watchUser', this.userSub);
        return this.userSub.asObservable();
    }
}

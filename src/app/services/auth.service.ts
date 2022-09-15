import { KrameriusApiService } from './kramerius-api.service';
import { Injectable } from '@angular/core';
import { User } from '../model/user.model';
import { HttpRequestCache } from './http-request-cache.service';
import { AppSettings } from './app-settings';
import { LicenceService } from './licence.service';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    user: User = null;
    redirectUrl: string;

    constructor(private settings: AppSettings, private licences: LicenceService, private api: KrameriusApiService, private cache: HttpRequestCache) {
        if ((settings.auth || settings.krameriusLogin || settings.keycloak) && !settings.multiKramerius) {
            this.userInfo(null, null);
        }
        this.settings.kramerius$.subscribe(() =>  {
            if (settings.auth || settings.krameriusLogin || settings.keycloak) {
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
            // console.log('USER', this.user);
            // console.log('Licences', this.user.licences);
            this.licences.assignUserLicences(this.user.licences);
            this.cache.clear();

            if (this.settings.keycloak) {
                this.api.getRights('uuid:1').subscribe(
                    (actions) => {
                        this.user.actions = actions || [];
                        console.log('user', this.user);
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
            this.licences.assignUserLicences([]);
            this.user = null;
            this.cache.clear();
        });
    }

    login() {
        let path = window.location.pathname + window.location.search;
        path = path.substring(this.settings.deployPath.length)
        localStorage.setItem('login.url', path);
        const redirectUri = `${this.baseUrl()}${this.settings.getRouteFor('keycloak')}`;
        const url = `${this.settings.keycloak.baseUrl}/realms/kramerius/protocol/openid-connect/auth?client_id=${this.settings.keycloak.clientId}&redirect_uri=${redirectUri}&response_type=code`;
        window.open(url, '_top');
    }

    keycloakAuth(code: string, callback: (status: string) => void = null) {
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
                const redirectUri2 = this.baseUrl();
                const url = `${this.settings.keycloak.baseUrl}/realms/kramerius/protocol/openid-connect/logout?redirect_uri=${redirectUri2}`;
                window.open(url, '_top');
            }
        );
    }

    logout(callback: () => void = null) {
        if (!this.isLoggedIn()) {
            return;
        }
        if (this.settings.keycloak) {
            this.settings.removeToken();
            this.api.logout().subscribe(user => {
                this.cache.clear();
                this.userInfo(null, null, () => {
                    const redirectUri = location.href;
                    const url = `${this.settings.keycloak.baseUrl}/realms/kramerius/protocol/openid-connect/logout?redirect_uri=${redirectUri}`;
                    window.open(url, '_top');
                });
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
        return this.user.actions.indexOf('a_read') >= 0;
    }
}

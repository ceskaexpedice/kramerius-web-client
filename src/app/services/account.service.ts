import { DocumentItem } from '../model/document_item.model';
import { AppSettings } from './app-settings';
import { CloudApiService } from './cloud-api.service';
import { Injectable } from '@angular/core';
import { AngularTokenService } from 'angular-token';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/shareReplay';
import 'rxjs/add/operator/do';
import { Metadata } from '../model/metadata.model';
import { HttpHeaders, HttpClient } from '@angular/common/http';


@Injectable()
export class AccountService {

    favourites: DocumentItem[] = [];
    favouritesMap = {};

    constructor(private tokenService: AngularTokenService,
                private appSettings: AppSettings,
                private http: HttpClient,
                private api: CloudApiService) {
        if (!this.serviceEnabled()) {
            return;
        }
        this.tokenService.validateToken().subscribe(
            response => {
                console.log('response', response);
                console.log('as', this.tokenService.currentUserData);
                console.log('tokenOptions', this.tokenService.tokenOptions);
                this.afterLogin();
            },
            error => {
                console.log('validateToken - error', error);
            }
        );
    }

    serviceEnabled(): boolean {
        return this.api.serviceEnabled();
    }

    processOAuthCallback(callback: (success: boolean) => void) {
        this.tokenService.processOAuthCallback();
        this.tokenService.validateToken().subscribe(
          response => {
            this.afterLogin();
            if (callback) {
                callback(true);
            }
          },
          error => {
            if (callback) {
                callback(false);
            }
        }
      );
    }


    login(email: string, password: string, callback: (success: boolean) => void) {
        return this.tokenService.signIn({
          login: email,
          password: password
        }).subscribe(
        (response) => {
            this.afterLogin();
            if (callback) {
                callback(true);
            }
        },
        (error) => {
            if (callback) {
                callback(false);
            }
        });
    }

    activateAccount(uid: string, token: string, clinecId: string, password: string, passwordConfirmations: string, callback: (success: boolean) => void) {
        const headers = new HttpHeaders({'uid': uid, 'client': clinecId, 'access-token': token});
        const options = { headers: headers };
        const url = `${this.tokenService.apiBase}/auth/password?password=${password}&password_confirmation=${passwordConfirmations}`;
        this.http.put(url, null, options).subscribe(
            (response) => {
                console.log('activateAccount success', response);
                this.tokenService.validateToken().subscribe(
                    () => {
                        this.afterLogin();
                        if (callback) {
                            callback(true);
                        }
                    },
                    error => {
                        if (callback) {
                            callback(false);
                        }
                    }
                );
            },
            (error) => {
                console.log('activateAccount failure', error);
                if (callback) {
                    callback(false);
                }
            });
    }


    signInOAuth(provider: string, callback: (success: boolean) => void) {
        this.tokenService.tokenOptions.oAuthWindowType = 'sameWindow'; // 'newWindow';
        console.log('this.tokenService.tokenOptions', this.tokenService.tokenOptions);
        this.tokenService.signInOAuth(provider).subscribe(
            (response) => {
                console.log('signInOAuth success', response);
                if (callback) {
                    callback(true);
                }
            },
            (error) => {
                console.log('signInOAuth failure', error);
                if (callback) {
                    callback(false);
                }
            });
    }


    resetPassword(email: string, callback: (success: boolean) => void) {
        this.tokenService.tokenOptions.resetPasswordCallback = window.location.origin + this.appSettings.getRouteFor('reset-password');
        this.tokenService.resetPassword( {login: email}).subscribe(
            () => {
                if (callback) {
                    callback(true);
                }
            },
            (error) => {
                if (callback) {
                    callback(false);
                }
            });
    }

    register(name: string, email: string, password: string, passwordConfirmation: string, callback: (success: boolean) => void) {
        this.tokenService.tokenOptions.registerAccountCallback = window.location.origin + this.appSettings.getRouteFor('signin');
        return this.tokenService.registerAccount({
            name: name,
            login: email,
            password: password,
            passwordConfirmation: passwordConfirmation
        }).subscribe(
        (response) => {
            console.log('register success', response);
            if (callback) {
                callback(true);
            }
        },
        (error) => {
            console.log('register error', error);
            if (callback) {
                callback(false);
            }
        });
    }


    logout(callback: () => any) {
        return this.tokenService.signOut().subscribe(() => {
            if (callback) {
                callback();
            }
        });
    }


    isLoggedIn(): boolean {
        return this.tokenService.userSignedIn() && !!this.tokenService.currentUserData;
    }

    fetchFavourites() {
        this.favourites = [];
        this.favouritesMap = {};
        this.api.getFavourites().subscribe((response) => {
            console.log('response', response);
            for (const doc of response as any[]) {
                this.addFavourite(this.buildDoc(doc));
            }
        });
    }

    isFavourited(uuid: string): boolean {
        return !!this.favouritesMap[uuid];
    }


    setLastPageIndex(uuid: string, index: number, callback: () => any) {
        if (!this.isLoggedIn()) {
            return;
        }
        this.api.setLastPageIndex(uuid, index).subscribe(
            (response) => {
                if (callback) {
                    callback();
                }
            },
            (error) => {
                console.log('CL setLastPageIndex error', error);
            }
        );
    }

    getLastPageIndex(uuid: string, callback: (index: number) => any) {
        if (!this.isLoggedIn()) {
            return;
        }
        this.api.getLastPageIndex(uuid).subscribe(
            (response) => {
                if (callback) {
                    callback(response['index']);
                }
            },
            (error) => {
                console.log('CL getLastPageIndex error', error);
            }
        );
    }

    markFavourite(metadata: Metadata, callback: () => any) {
        this.api.markFavourite(metadata).subscribe(
            (response) => {
                this.addFavourite(this.buildDoc(response));
                if (callback) {
                    callback();
                }
            },
            (error) => {
                console.log('CL markFavourite error', error);
            }
        );
    }

    unmarkFavourite(uuid: string, callback: () => any) {
        this.api.unmarkFavourite(uuid).subscribe(
            (response) => {
                this.removeFromFavourites(uuid);
                if (callback) {
                    callback();
                }
            },
            (error) => {
                console.log('CL unmarkFavourite error', error);
            }
        );
    }

    getName(): string {
        return this.tokenService.currentUserData ? this.tokenService.currentUserData.name : '';
    }

    getImage(): string {
        return this.tokenService.currentUserData ? this.tokenService.currentUserData.image : '';
    }

    hasRole(role: string): boolean {
        if (!this.tokenService.currentUserData) {
            return false;
        }
        const roles = this.tokenService.currentUserData['roles'];
        if (!roles) {
            return false;
        }
        return roles.split(',').indexOf(role) >= 0;
    }

    getTextProfile(): string {
        const name = this.getName();
        if (!name) {
            return '?';
        }
        return name[0];
    }




    private afterLogin() {
        console.log('is sign in', this.tokenService.userSignedIn());
        console.log('data', this.tokenService.currentUserData);
        this.fetchFavourites();
    }

    private userData() {
        return this.tokenService.currentUserData;
    }

    private addFavourite(item: DocumentItem) {
        this.favourites.unshift(item);
        this.favouritesMap[item.uuid] = item;
    }

    private removeFromFavourites(uuid: string) {
        const item = this.favouritesMap[uuid];
        const index = this.favourites.indexOf(item, 0);
        if (index > -1) {
            this.favourites.splice(index, 1);
        }
        this.favouritesMap[uuid] = null;
    }

    private buildDoc(doc: any): DocumentItem {
        const item = new DocumentItem();
        item.title = doc['title'];
        item.uuid = doc['uuid'];
        item.root_uuid = doc['uuid'];
        item.public = doc['policy'] === 'public';
        item.doctype = doc['doctype'];
        item.date = doc['date'];
        item.library = doc['kramerius'];
        item.authors = doc['author'] ? [doc['author']] : [];
        const prefix = this.appSettings.multiKramerius ? '/' + item.library : '';
        item.resolveUrl(prefix);
        return item;
    }

}

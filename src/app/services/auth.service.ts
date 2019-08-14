import { KrameriusApiService } from './kramerius-api.service';
import { Injectable } from '@angular/core';
import { User } from '../model/user.model';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/shareReplay';
import 'rxjs/add/operator/do';
import { HttpRequestCache } from './http-request-cache.service';


@Injectable()
export class AuthService {

    user: User = null;

    constructor(private krameriusApi: KrameriusApiService, private cache: HttpRequestCache) {
        console.log('AuthService initialized');
    }

    login(username: string, password: string) {
        return this.krameriusApi.getUserInfo(username, password)
                                .do(user => {
                                    this.user = user;
                                    this.cache.clear();
                                });
    }

    logout() {
        if (!this.isLoggedIn()) {
            return;
        }
        return this.krameriusApi.logout()
                                .do(user => {
                                    this.cache.clear();
                                    this.user = null;
                                });
    }


    isLoggedIn(): boolean {
        return this.user && this.user.isLoggedIn();
    }

}

import { DocumentItem } from './../model/document_item.model';
import { AppSettings } from './app-settings';
import { CloudApiService } from './cloud-api.service';
import { Injectable } from '@angular/core';
import { AngularTokenService } from 'angular-token';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/shareReplay';
import 'rxjs/add/operator/do';
import { Observable } from 'rxjs';
import { Metadata } from '../model/metadata.model';


@Injectable()
export class CloudAuthService {

    favourites: DocumentItem[] = [];
    favouritesMap = {};

    constructor(private tokenService: AngularTokenService,
                private appSettings: AppSettings,
                private api: CloudApiService) {
        if (!appSettings.loginEnabled) {
            return;
        }
        console.log('CloudAuthService initialized');
        console.log('user data', this.tokenService.currentUserData);
        this.tokenService.validateToken().subscribe(
            response => {
                console.log('response', response);
                console.log('as', this.tokenService.currentUserData);
                this.fetchFavourites();
            },
            error => {
                console.log('validateToken - error', error);
            }
        );
    }


    login(email: string, password: string): Observable<Response> {
        return this.tokenService.signIn({
          login: email,
          password: password
        });
    }


    logout(): Observable<Response> {
        return this.tokenService.signOut();
    }


    isLoggedIn(): boolean {
        return this.tokenService.userSignedIn();
    }

    userData() {
        return this.tokenService.currentUserData;
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

    private addFavourite(item: DocumentItem) {
        this.favourites.push(item);
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
        item.authors = doc['author'] ? [doc['author']] : [];
        item.resolveUrl(this.appSettings.getPathPrefix());
        return item;
    }

    isFavourited(uuid: string): boolean {
        return !!this.favouritesMap[uuid];
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


    afterLogin() {

    }

}

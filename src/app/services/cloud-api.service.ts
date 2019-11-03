import { Metadata } from './../model/metadata.model';
import { AppError } from '../common/errors/app-error';
import { NotFoundError } from '../common/errors/not-found-error';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { throwError } from 'rxjs';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { UnauthorizedError } from '../common/errors/unauthorized-error';
import { Response } from '@angular/http/src/static_response';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppSettings } from './app-settings';

@Injectable()
export class CloudApiService {

    constructor(private http: HttpClient, private appSettings: AppSettings) {
    }

    private doGet(path: string, params: any = {}): Observable<Object> {
        return this.http.get(encodeURI(this.appSettings.cloudApiBase + '/' + path), {params: params});
    }

    private doPost(path: string, body: any = null): Observable<Object> {
        return this.http.post(encodeURI(this.appSettings.cloudApiBase + '/' + path), body);
    }

    serviceEnabled(): boolean {
        return !!this.appSettings.cloudApiBase;
    }

    getFavourites() {
        const url = 'favourites';
        return this.doGet(url);
    }

    getLastPageIndex(uuid: string) {
        const params = {
            uuid: uuid,
            kramerius: this.appSettings.code
        };
        const url = 'last_page_indices';
        return this.doGet(url, params);
    }

    setLastPageIndex(uuid: string, index: number) {
        const params = {
            uuid: uuid,
            index: index,
            kramerius: this.appSettings.code
        };
        const url = 'last_page_indices';
        return this.doPost(url, params);
    }

    markFavourite(metadata: Metadata): Observable<Object> {
        const body = {
            uuid: metadata.uuid,
            doctype: metadata.model,
            policy: metadata.isPublic ? 'public' : 'private',
            title: metadata.getShortTitle(),
            kramerius: this.appSettings.code
        };
        if (metadata.publishers.length > 0) {
            body['date'] = metadata.publishers[0].date;
        }
        if (metadata.authors.length > 0) {
            body['author'] = metadata.authors[0].name;
        }
        return this.doPost('favourites', body);
    }

    unmarkFavourite(uuid: string): Observable<Object> {
        const body = {
            uuid: uuid,
            kramerius: this.appSettings.code
        };
        return this.doPost('favourites/revoke', body);
    }

    getCitation(uuid: string): Observable<string> {
        const url =  `https://citace.kramerius.cloud/v1/kramerius?url=${this.appSettings.url}&uuid=${uuid}&format=html`;
        return this.doGetText(url).catch(this.handleError);
    }


    private doGetText(url: string): Observable<string> {
        return this.http.get(encodeURI(url), { observe: 'response', responseType: 'text' })
        .map(response => response['body']);
    }

    private handleError(error: Response) {
        if (error.status === 404) {
            return throwError(new NotFoundError());
        } else if (error.status === 401 || error.status === 403) {
            return throwError(new UnauthorizedError());
        }
        return throwError(new AppError(error));
    }

}

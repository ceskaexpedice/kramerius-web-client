import { AppError } from './../common/errors/app-error';
import { NotFoundError } from './../common/errors/not-found-error';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class KrameriusApiService {

    private static STREAM_DC = 'DC';
    private static STREAM_MODS = 'BIBLIO_MODS';

    private BASE_URL = 'http://kramerius.mzk.cz';


    constructor(private http: Http) { }


    private handleError(error: Response) {
        if (error.status === 404) {
          return Observable.throw(new NotFoundError());
        }
        return Observable.throw(new AppError(error));
    }

    private getItemStreamUrl(uuid: string, stream: string) {
        return this.getItemUrl(uuid) + '/streams/' + stream;
    }

    private getItemUrl(uuid: string) {
        return this.BASE_URL + '/search/api/v5.0/item/' + uuid;
    }

    getThumbUrl(uuid: string) {
        return this.getItemUrl(uuid) + '/thumb';
    }

    getDc(uuid: string) {
        const url = this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_DC);
        return this.http.get(url)
          .map(response => response['_body'])
          .catch(this.handleError);
    }

    getMods(uuid: string) {
        const url = this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_MODS);
        return this.http.get(url)
          .map(response => response['_body'])
          .catch(this.handleError);
    }

    getChildren(uuid: string) {
        const url = this.getItemUrl(uuid) + '/children';
        return this.http.get(url)
          .map(response => response.json())
          .catch(this.handleError);
    }

    getItem(uuid: string) {
        const url = this.getItemUrl(uuid);
        return this.http.get(url)
          .map(response => response.json())
          .catch(this.handleError);
    }

    getZoomifyRootUrl(uuid: string): string {
        return `${this.BASE_URL}/search/zoomify/${uuid}/`;
    }

    getZoomifyProperties(uuid: string) {
        const url = `${this.getZoomifyRootUrl(uuid)}ImageProperties.xml`;
        return this.http.get(url);
    }


}

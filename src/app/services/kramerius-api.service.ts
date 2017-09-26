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

    private BASE_URL = 'https://kramerius.mzk.cz';
    // private BASE_URL = 'http://kramerius4.nkp.cz';
    // private BASE_URL = 'http://kramerius4.mlp.cz';



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


    getSearchResults(query: string) {
        const url = this.BASE_URL + '/search/api/v5.0/search?fl=PID,dostupnost,dc.creator,dc.title,datum_str,fedora.model,img_full_mime&q=_query_:%22{!dismax%20qf=%27dc.title^1000%20text^0.0001%27%20v=$q1}%22%20AND%20(fedora.model:monograph^5%20OR%20fedora.model:periodical^5%20OR%20fedora.model:soundrecording%20OR%20fedora.model:map%20OR%20fedora.model:graphic%20OR%20fedora.model:sheetmusic%20OR%20fedora.model:archive%20OR%20fedora.model:manuscript)&q1=' + query + '&rows=60&start=0';
        return this.http.get(url)
            .map(response => response.json())
            .catch(this.handleError);
    }

    getSearchAutocompleteUrl(term: string) {
        return this.BASE_URL + '/search/api/v5.0/search/?fl=PID,dc.title,dc.creator&q=dc.title:'
        + term.toLowerCase()
        + '*+AND+(fedora.model:monograph%5E4+OR+fedora.model:map+'
        + 'OR+fedora.model:graphic+OR+fedora.model:archive+OR+fedora.model:manuscript)'
        + '+AND+dostupnost:public&rows=30';
    }


    getThumbUrl(uuid: string) {
        return this.getItemUrl(uuid) + '/thumb';
    }

    // getThumbUrl2(uuid: string) {
    //     return `${this.BASE_URL}/search/img?pid=${uuid}&stream=IMG_THUMB&action=GETRAW`;
    // }

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
        return this.http.get(url)
            .map(response => response['_body'])
            .catch(this.handleError);
    }


}

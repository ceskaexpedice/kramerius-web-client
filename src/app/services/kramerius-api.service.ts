import { BrowseQuery } from './../browse/browse_query.model';
import { SearchQuery } from './../search/search_query.model';
import { SolrService } from './solr.service';
import { Utils } from './utils.service';
import { AppError } from './../common/errors/app-error';
import { NotFoundError } from './../common/errors/not-found-error';
import { Injectable } from '@angular/core';
import { Http, ResponseContentType } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { UnauthorizedError } from '../common/errors/unauthorized-error';

@Injectable()
export class KrameriusApiService {

    private static STREAM_DC = 'DC';
    private static STREAM_MODS = 'BIBLIO_MODS';
    private static STREAM_OCR = 'TEXT_OCR';
    private static STREAM_JPEG = 'IMG_FULL';
    private static STREAM_ALTO = 'ALTO';

    private BASE_URL = 'https://kramerius.mzk.cz';
    // private BASE_URL = 'https://kramerius.lib.cas.cz';
    // private BASE_URL = 'http://kramerius4.nkp.cz';
    // private BASE_URL = 'http://kramerius4.mlp.cz';


    private API_URL = this.BASE_URL + '/search/api/v5.0';

    private cache = {};

    constructor(private http: Http,
        private utils: Utils,
        private solrService: SolrService) {
    }

    private handleError(error: Response) {
        if (error.status === 404) {
            return Observable.throw(new NotFoundError());
        } else if (error.status === 401 || error.status === 403) {
            return Observable.throw(new UnauthorizedError());
        }
        return Observable.throw(new AppError(error));
    }

    private getItemStreamUrl(uuid: string, stream: string) {
        return this.getItemUrl(uuid) + '/streams/' + stream;
    }

    private getItemUrl(uuid: string) {
        return this.API_URL + '/item/' + uuid;
    }

    getSearchResults(query: SearchQuery) {
        let url = this.API_URL + '/search?'
            + query.buildQuery(null);

        const ordering = query.getOrderingValue();
        if (ordering) {
            url += '&sort=' + ordering;
        }
        url += '&rows=' + query.getRows();
        url += '&start=' + query.getStart();
        return this.http.get(url)
            .map(response => response.json())
            .catch(this.handleError);
    }

    getBrowseResults(query: BrowseQuery) {
        const url = this.API_URL + '/search?'
            + query.buildQuery();
        return this.http.get(url)
            .map(response => response.json())
            .catch(this.handleError);
    }

    getFacetList(query: SearchQuery, field: string) {
        let url = this.API_URL + '/search?'
                + query.buildQuery(field);
        url += '&facet=true&facet.field=' + SearchQuery.getSolrField(field)
            + '&facet.limit=50'
            + '&rows=0&facet.mincount=1';

        return this.http.get(url)
            .map(response => {
                if (field === 'accessibility') {
                    return this.solrService.facetAccessibilityList(response.json());
                // } else if (field === 'keywords') {
                    // return this.solrService.facetList(response.json(), field, query.keywords);
                } else {
                    return this.solrService.facetList(response.json(), SearchQuery.getSolrField(field), query[field], field !== 'doctypes');
                }
            })
            .catch(this.handleError);
    }


    getNewest() {
        const url = this.API_URL + '/search?fl=PID,dostupnost,dc.creator,dc.title,datum_str,fedora.model,img_full_mime&q=(fedora.model:monograph%20OR%20fedora.model:periodical%20OR%20fedora.model:soundrecording%20OR%20fedora.model:map%20OR%20fedora.model:graphic%20OR%20fedora.model:sheetmusic%20OR%20fedora.model:archive%20OR%20fedora.model:manuscript)+AND+dostupnost:public&sort=created_date desc&rows=24&start=0';
        return this.http.get(url)
            .map(response => this.solrService.documentItems(response.json()))
            .catch(this.handleError);
    }

    getFulltextUuidList(uuid, query) {
        const url = this.API_URL + '/search/?fl=PID&q=parent_pid:%22'
            + uuid
            + '%22%20AND%20text_ocr:'
            + query
            + '&rows=200';
        return this.http.get(url)
            .map(response => this.solrService.uuidList(response.json()))
            .catch(this.handleError);
    }

    getRecommended() {
        const url = this.API_URL + '/feed/custom';
        return this.http.get(url)
            .map(response => this.utils.parseRecommended(response.json()))
            .catch(this.handleError);
    }

    getCollections() {
        const url = this.API_URL + '/vc';
        return this.http.get(url)
            .map(response => response.json())
            .catch(this.handleError);
    }


    getPeriodicalVolumes(uuid: string) {
        const url = this.API_URL + '/search?fl=PID,dostupnost,fedora.model,dc.title,datum_str,details&q=pid_path:' + this.utils.escapeUuid(uuid) + '/*%20AND%20level:1%20AND%20(fedora.model:periodicalvolume)&sort=datum%20asc,datum_str%20asc,fedora.model%20asc&rows=1500&start=0';
        return this.http.get(url)
            .map(response => response.json())
            .catch(this.handleError);
    }

    getPeriodicalIssues(periodicalUuid: string, volumeUuid: string) {
        const url = this.API_URL + '/search?fl=PID,dostupnost,fedora.model,dc.title,datum_str,details&q=pid_path:' + this.utils.escapeUuid(periodicalUuid) + '/' + this.utils.escapeUuid(volumeUuid)  + '/*%20AND%20level:2%20AND%20(fedora.model:periodicalitem%20OR%20fedora.model:supplement)&sort=datum%20asc,datum_str%20asc,fedora.model%20asc&rows=1500&start=0';
        return this.http.get(url)
            .map(response => response.json())
            .catch(this.handleError);
    }



    getSearchAutocompleteUrl(term: string) {
        return this.API_URL + '/search/?fl=PID,dc.title,dc.creator&q=dc.title:'
        + term.toLowerCase()
        + '*+AND+(fedora.model:monograph%5E5+OR+fedora.model:periodical%5E4+OR+fedora.model:map+'
        + 'OR+fedora.model:graphic+OR+fedora.model:archive+OR+fedora.model:manuscript)'
        + '+AND+dostupnost:public&rows=30';
    }


    getThumbUrl(uuid: string) {
        return this.getItemUrl(uuid) + '/thumb';
    }

    getFullJpegUrl(uuid: string): string {
        return this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_JPEG);
    }

    getScaledJpegUrl(uuid: string, height: number): string {
        let url = this.BASE_URL + '/search/img?pid=' + uuid + '&stream=IMG_FULL';
        if (height) {
            url += '&action=SCALE&scaledHeight=' + height;
        }
        return url;
    }

    getLocalPrintUrl(uuids: string[]) {
        return this.BASE_URL + '/search/localPrintPDF'
            + '?pids=' + uuids.join(',')
            + '&pagesize=A4&imgop=FULL';
    }

    downloadPdef(uuids: string[]) {
        const url = this.API_URL + '/pdf/selection'
                + '?pids=' + uuids.join(',');
        return this.http.get(url, {
            responseType: ResponseContentType.Blob
        });
    }


    getOcr(uuid: string) {
        const url = this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_OCR);
        return this.http.get(url)
            .map(response => response['_body'])
            .catch(this.handleError);
    }

    getDc(uuid: string) {
        const url = this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_DC);
        return this.http.get(url)
          .map(response => response['_body'])
          .catch(this.handleError);
    }

    getAlto(uuid: string) {
        const url = this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_ALTO);
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
          .map(response => this.utils.parseItem(response.json()))
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

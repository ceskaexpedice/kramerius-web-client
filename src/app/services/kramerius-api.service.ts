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
import { Response } from '@angular/http/src/static_response';
import { environment } from '../../environments/environment';

@Injectable()
export class KrameriusApiService {

    private static STREAM_DC = 'DC';
    private static STREAM_MODS = 'BIBLIO_MODS';
    private static STREAM_OCR = 'TEXT_OCR';
    private static STREAM_JPEG = 'IMG_FULL';
    private static STREAM_ALTO = 'ALTO';
    private static STREAM_MP3 = 'MP3';

    // private BASE_URL = 'https://kramerius.mzk.cz';
    // private BASE_URL = 'http://zvuk.nm.cz';
    // private BASE_URL = 'https://kramerius.lib.cas.cz';
    // private BASE_URL = 'http://kramerius4.nkp.cz';
    // private BASE_URL = 'http://kramerius4.mlp.cz';

    private BASE_URL: string;
    private API_URL: string;
    private cache = {};

    constructor(private http: Http,
        private utils: Utils,
        private solrService: SolrService) {
        this.BASE_URL = environment.url;
        this.API_URL = this.BASE_URL + '/search/api/v5.0';
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

    private doGet(url: string): Observable<Response> {
        return this.http.get(encodeURI(url));
    }


    getSearchResults(query: string) {
        const url = this.API_URL + '/search?'
            + query;
        return this.doGet(url)
            .map(response => response.json())
            .catch(this.handleError);
    }


    // getSearchResults(query: SearchQuery) {
    //     let url = this.API_URL + '/search?'
    //         + query.buildQuery(null);

    //     const ordering = query.getOrderingValue();
    //     if (ordering) {
    //         url += '&sort=' + ordering;
    //     }
    //     url += '&fl=PID,dostupnost,model_path,dc.creator,root_title,root_pid,datum_str,img_full_mime';
    //     url += '&group=true&group.field=root_pid&group.ngroups=true&group.truncate=true&group.facet=true';
    //     url += '&facet=true&facet.mincount=1';
    //     url += '&facet.field=model_path&facet.field=dostupnost&facet.field=collection&facet.field=facet_autor&facet.field=keywords&facet.field=language';
    //     url += '&rows=' + query.getRows();
    //     url += '&start=' + query.getStart();
    //     return this.doGet(url)
    //         .map(response => response.json())
    //         .catch(this.handleError);
    // }

    getBrowseResults(query: BrowseQuery) {
        const url = this.API_URL + '/search?'
            + query.buildQuery();
        return this.doGet(url)
            .map(response => response.json())
            .catch(this.handleError);
    }

    // getFacetList(query: SearchQuery, field: string) {
    //     let url = this.API_URL + '/search?'
    //             + query.buildQuery(field);
    //     url += '&facet=true&facet.field=' + SearchQuery.getSolrField(field)
    //         + '&facet.limit=50'
    //         + '&rows=0&facet.mincount=1';

    //     return this.doGet(url)
    //         .map(response => {
    //             if (field === 'accessibility') {
    //                 return this.solrService.facetAccessibilityList(response.json());
    //             // } else if (field === 'keywords') {
    //                 // return this.solrService.facetList(response.json(), field, query.keywords);
    //             } else {
    //                 return this.solrService.facetList(response.json(), SearchQuery.getSolrField(field), query[field], field !== 'doctypes');
    //             }
    //         })
    //         .catch(this.handleError);
    // }


    getNewest() {
        const url = this.API_URL + '/search?fl=PID,dostupnost,dc.creator,dc.title,datum_str,fedora.model,img_full_mime&q=(fedora.model:monograph OR fedora.model:periodical OR fedora.model:soundrecording OR fedora.model:map OR fedora.model:graphic OR fedora.model:sheetmusic OR fedora.model:archive OR fedora.model:manuscript)+AND+dostupnost:public&sort=created_date desc&rows=24&start=0';
        return this.doGet(url)
            .map(response => this.solrService.documentItems(response.json()))
            .catch(this.handleError);
    }

    getFulltextUuidList(uuid, query) {
        const url = this.API_URL + '/search/?fl=PID&q=parent_pid:"'
            + uuid + '"'
            + ' AND fedora.model:page'
            + ' AND text:'
            + query
            + '&rows=200';
        return this.doGet(url)
            .map(response => this.solrService.uuidList(response.json()))
            .catch(this.handleError);
    }

    getRecommended() {
        const url = this.API_URL + '/feed/custom';
        return this.doGet(url)
            .map(response => this.utils.parseRecommended(response.json()))
            .catch(this.handleError);
    }

    getCollections() {
        const url = this.API_URL + '/vc';
        return this.doGet(url)
            .map(response => response.json())
            .catch(this.handleError);
    }

    getMonographUnits(uuid: string) {
        const url = this.API_URL + '/search?fl=PID,dostupnost,fedora.model,dc.title,datum_str,details&q=pid_path:' + this.utils.escapeUuid(uuid) + '/* AND level:1 AND (fedora.model:monographunit OR fedora.model:page)&sort=datum asc,datum_str asc,fedora.model asc&rows=1500&start=0';
        return this.doGet(url)
            .map(response => response.json())
            .catch(this.handleError);
    }

    getPeriodicalVolumes(uuid: string) {
        const url = this.API_URL + '/search?fl=PID,dostupnost,fedora.model,dc.title,datum_str,details&q=pid_path:' + this.utils.escapeUuid(uuid) + '/* AND level:1 AND (fedora.model:periodicalvolume)&sort=datum asc,datum_str asc,fedora.model asc&rows=1500&start=0';
        return this.doGet(url)
            .map(response => response.json())
            .catch(this.handleError);
    }

    getPeriodicalIssues(periodicalUuid: string, volumeUuid: string) {
        const url = this.API_URL + '/search?fl=PID,dostupnost,fedora.model,dc.title,datum_str,details&q=pid_path:' + this.utils.escapeUuid(periodicalUuid) + '/' + this.utils.escapeUuid(volumeUuid)  + '/* AND level:2 AND (fedora.model:periodicalitem OR fedora.model:supplement OR fedora.model:page)&sort=datum asc,datum_str asc,fedora.model asc&rows=1500&start=0';
        return this.doGet(url)
            .map(response => response.json())
            .catch(this.handleError);
    }

    getPeriodicalFulltextPages(periodicalUuid: string, volumeUuid: string, query: string, offset: number, limit: number, accessibility: string) {
        let url = this.API_URL + '/search?fl=PID,root_pid,pid_path,dostupnost,dc.title,parent_pid&q=';
        if (volumeUuid) {
            url += 'pid_path:' + this.utils.escapeUuid(periodicalUuid) + '/' + this.utils.escapeUuid(volumeUuid)  + '/*';
        } else {
            url += 'root_pid:"' + periodicalUuid + '"';
        }
        if (accessibility === 'public' || accessibility === 'private') {
            url += ' AND dostupnost:' + accessibility;
        }
        url += ' AND fedora.model:page AND text:' + query
            // + '&sort=datum asc'
            + '&rows=' + limit + '&start=' + offset + '&hl=true&hl.fl=text&hl.mergeContiguous=true&hl.snippets=1&hl.fragsize=120&hl.simple.pre=<strong>&hl.simple.post=</strong>';
        return this.doGet(url)
            .map(response => response.json())
            .catch(this.handleError);
    }

    getPeriodicalItemDetails(uuids: string[]) {
        const url = this.API_URL + '/search?fl=PID,details,dostupnost,fedora.model,dc.title,datum_str&q=PID:"' + uuids.join('" OR PID:"') + '"&rows=50';
        return this.doGet(url)
            .map(response => response.json())
            .catch(this.handleError);
    }


    getSearchAutocompleteUrl(term: string, onlyPublic: boolean = false): string {
        let query = term.toLowerCase().trim()
                        .replace(/"/g, '\\"').replace(/~/g, '\\~')
                        .replace(/:/g, '\\:').replace(/-/g, '\\-').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/!/g, '\\!')
                        .split(' ').join(' AND dc.title:');
        if (!term.endsWith(' ') && !term.endsWith(':')) {
            query += '*';
        }
        let result = this.API_URL + '/search/?fl=PID,dc.title,dc.creator&q='
        + '(fedora.model:monograph^5 OR fedora.model:periodical^4 OR fedora.model:map '
        + 'OR fedora.model:graphic OR fedora.model:archive OR fedora.model:manuscript)';
        if (onlyPublic) {
            result += ' AND dostupnost:public';
        } else {
            result += ' AND (dostupnost:public^5 OR dostupnost:private)';

        }
        result += ' AND dc.title:'  + query + '&rows=30';
        return result;
    }


    getThumbUrl(uuid: string) {
        return this.getItemUrl(uuid) + '/thumb';
    }

    getFullJpegUrl(uuid: string): string {
        return this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_JPEG);
    }

    getPdfUrl(uuid: string): string {
        return this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_JPEG);
    }

    getMp3Url(uuid: string): string {
        return this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_MP3);
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
        return this.doGet(url)
            .map(response => response['_body'])
            .catch(this.handleError);
    }

    getDc(uuid: string) {
        const url = this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_DC);
        return this.doGet(url)
          .map(response => response['_body'])
          .catch(this.handleError);
    }

    getAlto(uuid: string) {
        const url = this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_ALTO);
        return this.doGet(url)
          .map(response => response['_body'])
          .catch(this.handleError);
    }

    getMods(uuid: string) {
        const url = this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_MODS);
        return this.doGet(url)
          .map(response => response['_body'])
          .catch(this.handleError);
    }

    getChildren(uuid: string) {
        const url = this.getItemUrl(uuid) + '/children';
        return this.doGet(url)
          .map(response => response.json())
          .catch(this.handleError);
    }

    getSiblings(uuid: string) {
        const url = this.getItemUrl(uuid) + '/siblings';
        return this.doGet(url)
          .map(response => response.json())
          .catch(this.handleError);
    }

    getItem(uuid: string) {
        const url = this.getItemUrl(uuid);
        return this.doGet(url)
          .map(response => this.utils.parseItem(response.json()))
          .catch(this.handleError);
    }

    getZoomifyRootUrl(uuid: string): string {
        return `${this.BASE_URL}/search/zoomify/${uuid}/`;
    }

    getZoomifyProperties(uuid: string) {
        const url = `${this.getZoomifyRootUrl(uuid)}ImageProperties.xml`;
        return this.doGet(url)
            .map(response => response['_body'])
            .catch(this.handleError);
    }







}

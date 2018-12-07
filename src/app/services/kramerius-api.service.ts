import { PeriodicalQuery } from './../periodical/periodical_query.model';
import { BrowseQuery } from './../browse/browse_query.model';
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
import { AppSettings } from './app-settings';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class KrameriusApiService {

    private static STREAM_DC = 'DC';
    private static STREAM_MODS = 'BIBLIO_MODS';
    private static STREAM_OCR = 'TEXT_OCR';
    private static STREAM_JPEG = 'IMG_FULL';
    private static STREAM_ALTO = 'ALTO';
    private static STREAM_MP3 = 'MP3';

    constructor(private http: HttpClient,
        private utils: Utils,
        private appSettings: AppSettings,
        private solrService: SolrService) {
    }

    private getbaseUrl(): string {
        return this.appSettings.url;
    }

    private getApiUrl(): string {
        return this.getbaseUrl() + '/search/api/v5.0';
    }

    private getApiUrlForKramerius(url: string): string {
        return url + '/search/api/v5.0';
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
        return this.getApiUrl() + '/item/' + uuid;
    }

    private getItemUrlForKramerius(uuid: string, url: string) {
        return this.getApiUrlForKramerius(url) + '/item/' + uuid;
    }

    private doGet(url: string): Observable<Object> {
        return this.http.get(encodeURI(url));
    }

    private doGetBlob(url: string): Observable<Blob> {
        return this.http.get(encodeURI(url), { observe: 'response', responseType: 'blob' })
        .map(response => response['body']);
    }

    private doGetText(url: string): Observable<string> {
        return this.http.get(encodeURI(url), { observe: 'response', responseType: 'text' })
        .map(response => response['body']);

    }

    getSearchResults(query: string) {
        const url = this.getApiUrl() + '/search?'
            + query;
        return this.doGet(url)
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
        const url = this.getApiUrl() + '/search?'
            + query.buildQuery();
        return this.doGet(url)
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
        const url = this.getApiUrl() + '/search?fl=PID,dostupnost,dc.creator,dc.title,datum_str,fedora.model,img_full_mime&q=(fedora.model:monograph OR fedora.model:periodical OR fedora.model:soundrecording OR fedora.model:map OR fedora.model:graphic OR fedora.model:sheetmusic OR fedora.model:archive OR fedora.model:manuscript)+AND+dostupnost:public&sort=created_date desc&rows=24&start=0';
        return this.doGet(url)
            .map(response => this.solrService.documentItems(response))
            .catch(this.handleError);
    }

    getFulltextUuidList(uuid, query) {
        const url = this.getApiUrl() + '/search/?fl=PID&q=parent_pid:"'
            + uuid + '"'
            + ' AND fedora.model:page'
            + ' AND text:'
            + query
            // + ' AND _query_:"{!edismax qf=\'text_ocr\' v=$q1}"'
            // + '&q1=' + query
            + '&rows=200';
        return this.doGet(url)
            .map(response => this.solrService.uuidList(response))
            .catch(this.handleError);
    }

    getRecommended() {
        const url = this.getApiUrl() + '/feed/custom';
        return this.doGet(url)
            .map(response => this.utils.parseRecommended(response))
            .catch(this.handleError);
    }

    getCollections() {
        const url = this.getApiUrl() + '/vc';
        return this.doGet(url)
            .map(response => response)
            .catch(this.handleError);
    }


    private getPeriodicalItems(pidPath: string, level: number, models: string[], query: PeriodicalQuery, applyYear: boolean) {
        const modelRestriction = models.map(a => 'fedora.model:' + a).join(' OR ');
        let url = this.getApiUrl() + '/search?fl=PID,dostupnost,fedora.model,dc.title,datum_str,details&q=pid_path:'
                + pidPath + '/* AND level:' + level + ' AND (' + modelRestriction + ')';
        if (query && (query.accessibility === 'private' || query.accessibility === 'public')) {
            url += ' AND dostupnost:' + query.accessibility;
        }
        if (query && applyYear && query.isYearRangeSet()) {
            url += ' AND (rok:[' + query.from + ' TO ' + query.to + '] OR (datum_begin:[* TO ' + query.to + '] AND datum_end:[' + query.from + ' TO *]))';
        }
        url += '&sort=';
        if (level > 1) {
            url += 'datum asc,';
        }
        url += 'datum_str asc,fedora.model asc,dc.title asc&rows=1500&start=0';
        // url += '&sort=datum asc,datum_str asc,fedora.model asc&rows=1500&start=0';
        return this.doGet(url)
            .catch(this.handleError);
    }

    getMonographUnits(uuid: string, query: PeriodicalQuery) {
        return this.getPeriodicalItems(this.utils.escapeUuid(uuid), 1, ['monographunit', 'page'], query, false);
    }

    getPeriodicalVolumes(uuid: string, query: PeriodicalQuery) {
        return this.getPeriodicalItems(this.utils.escapeUuid(uuid), 1, ['periodicalvolume'], query, true);
    }

    getPeriodicalIssues(periodicalUuid: string, volumeUuid: string, query: PeriodicalQuery) {
        const pidPath = this.utils.escapeUuid(periodicalUuid) + '/' + this.utils.escapeUuid(volumeUuid);
        return this.getPeriodicalItems(pidPath, 2, ['periodicalitem', 'supplement', 'page'], query, false);
    }

    getPeriodicalFulltextPages(periodicalUuid: string, volumeUuid: string, offset: number, limit: number, query: PeriodicalQuery) {
        let url = this.getApiUrl() + '/search?fl=PID,fedora.model,details,dc.creator,root_pid,model_path,pid_path,dostupnost,dc.title,parent_pid&q=';
        if (volumeUuid) {
            url += 'pid_path:' + this.utils.escapeUuid(periodicalUuid) + '/' + this.utils.escapeUuid(volumeUuid)  + '/*';
        } else {
            url += 'root_pid:"' + periodicalUuid + '"';
        }
        if (query.accessibility === 'public' || query.accessibility === 'private') {
            url += ' AND dostupnost:' + query.accessibility;
        }
        if (query.isYearRangeSet()) {
            url += ' AND (rok:[' + query.from + ' TO ' + query.to + '])';
        }// !img_full_mime:"application/pdf"
        url += ' AND (fedora.model:article || fedora.model:monographunit || fedora.model:page) AND !PID:*33@* AND text:' + query.fulltext;
        if (query.ordering === 'latest') {
            url += '&sort=datum desc, datum_str desc';
        } else if (query.ordering === 'earliest') {
            url += '&sort=datum asc, datum_str asc';
        }
        url += '&rows=' + limit + '&start=' + offset + '&hl=true&hl.fl=text&hl.mergeContiguous=true&hl.snippets=1&hl.fragsize=120&hl.simple.pre=<strong>&hl.simple.post=</strong>';
        return this.doGet(url)
            .catch(this.handleError);
    }

    getPeriodicalItemDetails(uuids: string[]) {
        const url = this.getApiUrl() + '/search?fl=PID,details,dostupnost,fedora.model,dc.title,datum_str&q=PID:"' + uuids.join('" OR PID:"') + '"&rows=50';
        return this.doGet(url)
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
        let result = this.getApiUrl() + '/search/?fl=PID,dc.title,dc.creator&q='
        + '(fedora.model:monograph%5E5 OR fedora.model:periodical%5E4 OR fedora.model:map '
        + 'OR fedora.model:graphic OR fedora.model:archive OR fedora.model:manuscript OR fedora.model:sheetmusic OR fedora.model:soundrecording OR fedora.model:article)';
        if (onlyPublic) {
            result += ' AND dostupnost:public';
        } else {
            result += ' AND (dostupnost:public%5E5 OR dostupnost:private)';

        }
        result += ' AND dc.title:'  + query + '&rows=30';
        return result;
    }


    getThumbUrl(uuid: string) {
        return this.getItemUrl(uuid) + '/thumb';
    }

    getThumbUrlForKramerius(uuid: string, url: string) {
        return this.getItemUrlForKramerius(uuid, url) + '/thumb';
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

    downloadMp3(uuid: string): Observable<Blob> {
        const url = this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_MP3);
        return this.doGetBlob(url);
    }

    getScaledJpegUrl(uuid: string, height: number): string {
        let url = this.getbaseUrl() + '/search/img?pid=' + uuid + '&stream=IMG_FULL';
        if (height) {
            url += '&action=SCALE&scaledHeight=' + height;
        }
        return url;
    }

    getLocalPrintUrl(uuids: string[]) {
        return this.getbaseUrl() + '/search/localPrintPDF'
            + '?pids=' + uuids.join(',')
            + '&pagesize=A4&imgop=FULL';
    }

    downloadPdef(uuids: string[]) {
        const url = this.getApiUrl() + '/pdf/selection'
                + '?pids=' + uuids.join(',');
        return this.doGetBlob(url);
    }


    getOcr(uuid: string): Observable<string> {
        const url = this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_OCR);
        return this.doGetText(url)
            .catch(this.handleError);
    }

    getDc(uuid: string) {
        const url = this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_DC);
        return this.doGet(url)
          .catch(this.handleError);
    }

    getAlto(uuid: string) {
        const url = this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_ALTO);
        return this.doGet(url)
          .catch(this.handleError);
    }

    getMods(uuid: string): Observable<string> {
        const url = this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_MODS);
        return this.doGetText(url)
          .catch(this.handleError);
    }

    getChildren(uuid: string): Observable<any[]> {
        const url = this.getItemUrl(uuid) + '/children';
        return this.doGet(url)
            .map(res => <any[]> res)
          .catch(this.handleError);
    }

    getSiblings(uuid: string) {
        const url = this.getItemUrl(uuid) + '/siblings';
        return this.doGet(url)
          .catch(this.handleError);
    }

    getItem(uuid: string) {
        const url = this.getItemUrl(uuid);
        return this.doGet(url)
        .map(response => this.utils.parseItem(response))
        .catch(this.handleError);
    }

    getZoomifyRootUrl(uuid: string): string {
        return `${this.getbaseUrl()}/search/zoomify/${uuid}/`;
    }

    getZoomifyProperties(uuid: string) {
        const url = `${this.getZoomifyRootUrl(uuid)}ImageProperties.xml`;
        return this.doGetText(url)
            .catch(this.handleError);
    }







}

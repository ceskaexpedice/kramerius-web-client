import { KrameriusInfo } from './../model/krameriusInfo.model';
import { PeriodicalQuery } from './../periodical/periodical_query.model';
import { SolrService } from './solr.service';
import { Utils } from './utils.service';
import { AppError } from './../common/errors/app-error';
import { NotFoundError } from './../common/errors/not-found-error';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { throwError } from 'rxjs';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { UnauthorizedError } from '../common/errors/unauthorized-error';
import { Response } from '@angular/http/src/static_response';
import { AppSettings } from './app-settings';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../model/user.model';
import { DocumentItem } from '../model/document_item.model';
import { CompleterItem } from 'ng2-completer';
import { SearchQuery } from '../search/search_query.model';
import { PeriodicalFtItem } from '../model/periodicalftItem.model';
import { PeriodicalItem } from '../model/periodicalItem.model';
import { BrowseItem } from '../model/browse_item.model';
import { BrowseQuery } from '../browse/browse_query.model';
import { Metadata } from '../model/metadata.model';
import { ModsParserService } from './mods-parser.service';

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
        private settings: AppSettings,
        private mods: ModsParserService,
        private solr: SolrService) {
    }

    private handleError(error: Response) {
        if (error.status === 404) {
            return throwError(new NotFoundError());
        } else if (error.status === 401 || error.status === 403) {
            return throwError(new UnauthorizedError());
        }
        return throwError(new AppError(error));
    }

    private doGet(url: string): Observable<Object> {
        return this.http.get(encodeURI(url)).catch(this.handleError);
    }

    private doGetText(url: string): Observable<string> {
        return this.http.get(encodeURI(url), { observe: 'response', responseType: 'text' })
        .map(response => response['body']).catch(this.handleError);
    }

    private getbaseUrl(): string {
        return this.settings.url;
    }

    private getApiUrlForBaseUrl(url: string): string {
        return `${url}/search/api/v${this.settings.apiVersion}`;
    }

    private getApiUrl(): string {
        return this.getApiUrlForBaseUrl(this.getbaseUrl());
    }

    private getItemUrl(uuid: string) {
        return this.getApiUrl().replace(/6.0/, '5.0') + '/item/' + uuid;
    }

    private getItemUrlForKramerius(uuid: string, url: string) {
        return this.getApiUrlForBaseUrl(url) + '/item/' + uuid;
    }

    private getItemStreamUrl(uuid: string, stream: string) {
        return this.getItemUrl(uuid) + '/streams/' + stream;
    }


    getThumbUrl(uuid: string): string {
        return this.getItemUrl(uuid) + '/thumb';
    }

    getThumbUrlForKramerius(uuid: string, url: string): string {
        return this.getItemUrlForKramerius(uuid, url) + '/thumb';
    }

    getSearchResults(query: string) {
        const url = this.getApiUrl() + '/search?'
            + query;
        return this.doGet(url);
    }

    getNewest(): Observable<DocumentItem[]> {
        return this.getSearchResults(this.solr.getNewestQuery())
            .map(response => this.solr.documentItems(response));
    }

    getFulltextSearchAutocomplete(term: string, uuid: string): Observable<CompleterItem[]> {
        return this.getSearchResults(this.solr.buildFulltextSearchAutocompleteQuery(term, uuid))
                    .map(response => this.solr.fulltextSearchAutocompleteResults(response));
    }

    getSearchAutocomplete(term: string, query: SearchQuery, publicOnly: boolean): Observable<CompleterItem[]> {
        return this.getSearchResults(this.solr.buildSearchAutocompleteQuery(term, query, publicOnly))
                    .map(response => this.solr.searchAutocompleteResults(response, term));
    }

    getPeriodicalFulltext(periodicalUuid: string, volumeUuid: string, offset: number, limit: number, query: PeriodicalQuery): Observable<[PeriodicalFtItem[], number]> {
        return this.getSearchResults(this.solr.buildPeriodicalFulltextSearchQuery(periodicalUuid, volumeUuid, offset, limit, query))
                    .map(response => [this.solr.periodicalFullTextItems(response, query.fulltext), this.solr.numberOfResults(response)]);
    }

    getPeriodicalItemsDetails(uuids: string[]): Observable<PeriodicalItem[]> {
        return this.getSearchResults(this.solr.buildPeriodicalItemsDetailsQuery(uuids))
            .map(response => this.solr.periodicalItemsDetails(response));
    }

    getPeriodicalVolumes(uuid: string, query: PeriodicalQuery): Observable<PeriodicalItem[]> {
        return this.getSearchResults(this.solr.buildPeriodicalVolumesQuery(uuid, query))
            .map(response => this.solr.periodicalItems(response, 'periodicalvolume'));
    }

    getPeriodicalIssues(uuid: string, query: PeriodicalQuery): Observable<PeriodicalItem[]> {
        return this.getSearchResults(this.solr.buildPeriodicalIssuesQuery(uuid, query))
            .map(response => this.solr.periodicalItems(response, 'periodicalitem'));
    }

    getMonographUnits(uuid: string, query: PeriodicalQuery): Observable<PeriodicalItem[]> {
        return this.getSearchResults(this.solr.buildMonographUnitsQuery(uuid, query))
            .map(response => this.solr.periodicalItems(response, 'monographunit'));
    }

    getBrowseItems(query: BrowseQuery): Observable<[BrowseItem[], number]> { 
        return this.getSearchResults(this.solr.buildBrowseQuery(query))
            .map(response => this.solr.browseItems(response, query));
    }

    getFulltextUuidList(uuid: string, query: string): Observable<string[]> {
        return this.getSearchResults(this.solr.buildFulltextUuidList(uuid, query))
            .map(response => this.solr.uuidList(response));
    }

    getMetadata(uuid: string, type: string = 'full'): Observable<Metadata> {
        return this.getMods(uuid).map( mods => this.mods.parse(mods, uuid, type));
    }














    getOcr(uuid: string): Observable<string> {
        return this.doGetText(this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_OCR));
    }

    getDc(uuid: string) {
        return this.doGetText(this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_DC));
    }

    getAlto(uuid: string) {
        return this.doGetText(this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_ALTO));
    }

    getMods(uuid: string): Observable<string> {
        return this.doGetText(this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_MODS));
    }

    getFoxml(uuid: string): Observable<string> {
        return this.doGetText(this.getItemUrl(uuid) + '/foxml');
    }




    getZoomifyBaseUrl(uuid: string): string {
        return this.getbaseUrl() + '/search/zoomify/' + uuid;
    }

    getIiifBaseUrl(uuid: string): string {
        return this.getbaseUrl() + '/search/iiif/' + uuid;
    }

    getIiifPresentation(uuid: string): Observable<any> {
        const url = this.getbaseUrl() + '/search/iiif-presentation/' + uuid + '/manifest';
        return this.doGet(url);
    }






    // getFulltextUuidList(uuid, query) {
    //     let text = query.toLowerCase().trim();
    //     const inQuotes = text.startsWith('"') && text.endsWith('"');
    //     if (!inQuotes) {
    //         text = text.replace(/"/g, '\\"');
    //     }
    //     text = text.replace(/~/g, '\\~')
    //     .replace(/:/g, '\\:').replace(/-/g, '\\-').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/!/g, '\\!');
    //     const url = this.getApiUrl() + '/search/?fl=PID&q=parent_pid:"'
    //         + uuid + '"'
    //         + ' AND fedora.model:page'
    //         + ' AND text:'
    //         + text
    //         + '&rows=200';
    //     return this.doGet(url)
    //         .map(response => this.solr.uuidList(response))
    //         .catch(this.handleError);
    // }

    //  getPeriodicalFulltextPages(periodicalUuid: string, volumeUuid: string, offset: number, limit: number, query: PeriodicalQuery) {
    //     let url = this.getApiUrl() + '/search?fl=PID,fedora.model,details,dc.creator,root_pid,model_path,pid_path,dostupnost,dc.title,parent_pid&q=';
    //     if (volumeUuid) {
    //         url += 'pid_path:' + this.utils.escapeUuid(periodicalUuid) + '/' + this.utils.escapeUuid(volumeUuid)  + '/*';
    //     } else {
    //         url += 'root_pid:"' + periodicalUuid + '"';
    //     }
    //     if (query.accessibility === 'public' || query.accessibility === 'private') {
    //         url += ' AND dostupnost:' + query.accessibility;
    //     }
    //     if (query.isYearRangeSet()) {
    //         url += ' AND (rok:[' + query.from + ' TO ' + query.to + '])';
    //     }
    //     const text = query.fulltext.toLowerCase().trim()
    //                     .replace(/"/g, '\\"').replace(/~/g, '\\~')
    //                     .replace(/:/g, '\\:').replace(/-/g, '\\-').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/!/g, '\\!');
    //     url += ' AND (fedora.model:article || fedora.model:monographunit || fedora.model:page) AND text:' + text;
    //     if (query.ordering === 'latest') {
    //         url += '&sort=datum desc, datum_str desc';
    //     } else if (query.ordering === 'earliest') {
    //         url += '&sort=datum asc, datum_str asc';
    //     }
    //     url += '&rows=' + limit + '&start=' + offset + '&hl=true&hl.fl=text&hl.mergeContiguous=true&hl.snippets=1&hl.fragsize=120&hl.simple.pre=<strong>&hl.simple.post=</strong>';
    //     return this.doGet(url)
    //         .catch(this.handleError);
    // }








    private doGetBlob(url: string): Observable<Blob> {
        return this.http.get(encodeURI(url), { observe: 'response', responseType: 'blob' })
        .map(response => response['body']);
    }


    getUserInfo(username: string, password: string): Observable<User> {
        const url = this.getApiUrl() + '/user';

        const headerParams = {
            'Content-Type':  'application/json',
        };
        if (username && password) {
            headerParams['Authorization'] = 'Basic ' + btoa(username + ':' + password);
        }

        const httpOptions = {
            headers: new HttpHeaders(headerParams)
          };
        return this.http.get(url, httpOptions)
            .map(response => User.fromJson(response, username, password));
    }


    logout() {
        const url = this.getApiUrl() + '/user/logout';
        return this.http.get(url).catch(this.handleError);
    }


    getRecommended() {
        const url = this.getApiUrl() + '/feed/custom';
        return this.doGet(url)
            .map(response => this.utils.parseRecommended(response));
    }

    getCollections() {
        const url = this.getApiUrl() + '/vc';
        return this.doGet(url)
            .map(response => response);
    }

    getKrameriusInfo(language: string): Observable<KrameriusInfo> {
        const url = this.getApiUrl() + '/info?language=' + language;
        return this.doGet(url)
            .map(response => KrameriusInfo.fromJson(response));
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

    downloadPdf(uuids: string[], language: string = 'cs') {
        const url = this.getApiUrl() + '/pdf/selection'
                + '?pids=' + uuids.join(',')
                + '&language=' + language;
        return this.doGetBlob(url);
    }



    getChildren(uuid: string): Observable<any[]> {
        const url = this.getItemUrl(uuid) + '/children';
        return this.doGet(url)
            .map(res => <any[]> res);
    }


    getItem(uuid: string) {
        const url = this.getItemUrl(uuid);
        return this.doGet(url)
        .map(response => this.utils.parseItem(response));
    }

    getRawItem(uuid: string) {
        const url = this.getItemUrl(uuid);
        return this.doGet(url);
    }








        // getSiblings(uuid: string) {
    //     const url = this.getItemUrl(uuid) + '/siblings';
    //     return this.doGet(url)
    //       .catch(this.handleError);
    // }


}

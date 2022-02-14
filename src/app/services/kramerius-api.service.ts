import { KrameriusInfo } from './../model/krameriusInfo.model';
import { PeriodicalQuery } from './../periodical/periodical_query.model';
import { SolrService } from './solr.service';
import { Utils } from './utils.service';
import { AppError } from './../common/errors/app-error';
import { NotFoundError } from './../common/errors/not-found-error';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { UnauthorizedError } from '../common/errors/unauthorized-error';
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
    private static STREAM_PREVIEW = 'IMG_PREVIEW';
    private static STREAM_ALTO = 'ALTO';
    private static STREAM_MP3 = 'MP3';

    constructor(private http: HttpClient,
        private utils: Utils,
        private settings: AppSettings,
        private mods: ModsParserService,
        private solr: SolrService) {
        // this.http.get('/search/api/v5.0/user?shib=default').subscribe((a)=>{
        // });
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

    private doGetBlob(url: string): Observable<Blob> {
        return this.http.get(encodeURI(url), { observe: 'response', responseType: 'blob' })
            .map(response => response['body']).catch(this.handleError);
    }

    private getbaseUrl(): string {
        return this.settings.url;
    }

    private getApiUrlForBaseUrl(url: string): string {
        if (this.settings.k5Compat()) {
            return `${url}/search/api/v5.0`;
        }
        return `${url}/search/api/client/v7.0`;
    }

    private getK5CompatApiUrl(): string {
        return `${this.getbaseUrl()}/search/api/v5.0`;
    }

    private getApiUrl(): string {
        return this.getApiUrlForBaseUrl(this.getbaseUrl());
    }

    private getItemUrl(uuid: string, url = null) {
        const item = this.settings.k5Compat() ? 'item' : 'items';
        return `${this.getApiUrlForBaseUrl(url ? url : this.getbaseUrl())}/${item}/${uuid}`;
    }

    private getItemStreamUrl(uuid: string, stream: string) {
        return this.getItemUrl(uuid) + '/streams/' + stream;
    }

    private getK7AuthUrl(): string {
        return `${this.getbaseUrl()}/search/api/auth/token`;
    }

    getFullJpegUrl(uuid: string): string {
        if (this.settings.k5Compat()) {
            return this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_JPEG);
        } else {
            return this.getItemUrl(uuid) + '/image';
        }
    }

    getThumbUrl(uuid: string): string {
        if (this.settings.k5Compat()) {
            return this.getItemUrl(uuid) + '/thumb';
        } else {
            return this.getItemUrl(uuid) + '/image/thumb';
        }
    }

    getThumbUrlForKramerius(uuid: string, url: string): string {
        if (this.settings.k5Compat()) {
            return this.getItemUrl(uuid, url) + '/thumb';
        } else {
            return this.getItemUrl(uuid, url) + '/image/thumb';
        }
    }

    // getThumbUrl(uuid: string) {
    //     return this.getbaseUrl() + `/search/img?pid=${uuid}&stream=IMG_THUMB&action=GETRAW`;
    // }

    // getThumbUrlForKramerius(uuid: string, url: string) {
    //     return url + `/search/img?pid=${uuid}&stream=IMG_THUMB&action=GETRAW`;
    // }

    getSearchResults(query: string) {
        return this.doGet(this.getSearchResultsUrl(query));
    }

    getNumberOfRootsPages(root: string): Observable<number> {
        return this.getSearchResults(this.solr.buildNumberOfRootsPagesQuery(root))
            .map(response => this.solr.numberOfResults(response));
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

    getPeriodicalFulltext(periodicalUuid: string, volumeUuid: string, offset: number, limit: number, query: PeriodicalQuery, models: string[]): Observable<[PeriodicalFtItem[], number]> {
        return this.getSearchResults(this.solr.buildPeriodicalFulltextSearchQuery(periodicalUuid, volumeUuid, offset, limit, query, models))
            .map(response => [this.solr.periodicalFullTextItems(response, query.fulltext), this.solr.numberOfResults(response)] as [PeriodicalFtItem[], number]);
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
            .map(response => this.solr.periodicalItems(response, 'periodicalitem', uuid));
    }

    getMonographUnits(uuid: string, query: PeriodicalQuery): Observable<DocumentItem[]> {
        return this.getSearchResults(this.solr.buildMonographUnitsQuery(uuid, query))
            .map(response => this.solr.monographUnits(response));
    }

    getOmnibusUnits(uuid: string, query: PeriodicalQuery): Observable<DocumentItem[]> {
        return this.getSearchResults(this.solr.buildOmnibusUnitsQuery(uuid, query))
            .map(response => this.solr.omnibusUnits(response));
    }

    getBrowseItems(query: BrowseQuery): Observable<[BrowseItem[], number]> {
        return this.getSearchResults(this.solr.buildBrowseQuery(query))
            .map(response => this.solr.browseItems(response, query));
    }

    getDocumentFulltextPage(uuids: string[], query: string): Observable<string[]> {
        return this.getSearchResults(this.solr.buildDocumentFulltextQuery(uuids, query))
            .map(response => this.solr.documentFulltextQuery(response));
    }

    getMetadata(uuid: string, type: string = 'full'): Observable<Metadata> {
        return this.getMods(uuid).map(mods => this.mods.parse(mods, uuid, type));
    }

    getItem(uuid: string): Observable<DocumentItem> {
        if (this.settings.k5Compat()) {
            return this.doGet(this.getItemUrl(uuid)).map(response => this.utils.parseItem(response));
        } else {
            return this.getSearchResults(this.solr.buildDocumentQuery(uuid)).map(response => this.solr.documentItem(response));
        }
    }

    getOcrUrl(uuid: string): string {
        if (this.settings.k5Compat()) {
            return this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_OCR);
        } else {
            return this.getItemUrl(uuid) + '/ocr/text';
        }
    }

    getAltoUrl(uuid: string): string {
        if (this.settings.k5Compat()) {
            return this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_ALTO);
        } else {
            return this.getItemUrl(uuid) + '/ocr/alto';
        }
    }

    getOcr(uuid: string): Observable<string> {
        return this.doGetText(this.getOcrUrl(uuid));
    }

    getAlto(uuid: string) {
        return this.doGetText(this.getAltoUrl(uuid));
    }

    getDc(uuid: string) {
        return this.doGetText(this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_DC));
    }

    getMods(uuid: string): Observable<string> {
        return this.doGetText(this.getModsUrl(uuid));
    }

    getZoomifyBaseUrl(uuid: string): string {
        if (this.settings.k5Compat()) {
            return this.getbaseUrl() + '/search/zoomify/' + uuid;
        } else {
            return this.getItemUrl(uuid) + '/image/zoomify';
        }
    }

    getIiifBaseUrl(uuid: string): string {
        return this.getbaseUrl() + '/search/iiif/' + uuid;
    }

    getIiifPresentation(uuid: string): Observable<any> {
        const url = this.getbaseUrl() + '/search/iiif-presentation/' + uuid + '/manifest';
        return this.doGet(url);
    }

    getIiifManifestUrl(uuid: string): string {
        const url = this.getbaseUrl() + '/search/iiif-presentation/' + uuid + '/manifest';
        return url;
    }

    getModsUrl(uuid: string): string {
        if (this.settings.k5Compat()) {
            return this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_MODS);
        } else {
            return this.getItemUrl(uuid) + '/metadata/mods';
        }
    }

    getDcUrl(uuid: string): string{
        return this.getItemUrl(uuid) + '/streams/DC';
    }

    getFoxmlUrl(uuid: string): string {
        if (this.settings.k5Compat()) {
            return this.getItemUrl(uuid) + '/foxml';
        } else {
            return this.getbaseUrl() + `/search/api/admin/v1.0/items/${uuid}/foxml`;
        }
    }

    getFoxml(uuid: string): Observable<string> {
        return this.doGetText(this.getFoxmlUrl(uuid));
    }


    getSearchResultsUrl(query: string): string {
        return this.getApiUrl() + '/search?' + query;
    }

    getUserInfo(username: string, password: string): Observable<User> {
        const url = this.getApiUrl() + '/user';
        const headerParams = {
            'Content-Type': 'application/json',
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

    auth(username: string, password: string): Observable<string> {
        const url = this.getK7AuthUrl();
        const body = `username=${username}&password=${password}`;
        return this.http.post(url, body)
            .map(response => response['access_token']);
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

    getPdfUrl(uuid: string): string {
        return this.getFullJpegUrl(uuid);
    }

    getMp3Url(uuid: string): string {
        if (this.settings.k5Compat()) {
            return this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_MP3);
        } else {
            return this.getItemUrl(uuid) + '/audio/mp3';
        }
    }

    downloadMp3(uuid: string): Observable<Blob> {
        return this.doGetBlob(this.getMp3Url(uuid));
    }

    getPdfPreviewBlob(uuid: string): Observable<boolean> {
        if (this.settings.k5Compat()) {
            return this.doGetBlob(this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_PREVIEW)).map(() => true);
        } else {
            return this.doGetBlob(this.getItemUrl(uuid) + '/image').map(() => true);
        }
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

    getChildren(uuid: string, own: boolean = true): Observable<any> {
        // if (this.settings.k5Compat()) {
        //     return this.doGet(this.getItemUrl(uuid) + '/children')
        //         .map(response => this.utils.parseBookChild(response));
        // } else {
            return this.getSearchResults(this.solr.buildBookChildrenQuery(uuid, own))
                .map(response => this.solr.bookChildItems(response));
        // }
    }


    getRawChildren(uuid: string): Observable<any> {
        if (this.settings.k5Compat()) {
            return this.doGet(this.getItemUrl(uuid) + '/children');
        } else {
            return this.getSearchResults(this.solr.buildBookChildrenQuery(uuid, false));
        }
    }


    getRawItem(uuid: string): Observable<any> {
        const url = this.getItemUrl(uuid);
        return this.doGet(url);
    }

    getItemInfo(uuid: string): Observable<any> {
        if (this.settings.k5Compat()) {
            return this.doGet(this.getItemUrl(uuid))
                .map(response => this.parseItemInfoForPage(response));
        } else {
            return this.doGet(this.getItemUrl(uuid) + '/info')
                .map(response => this.parseItemInfoForPage(response));
        }
    }

    private parseItemInfoForPage(json) {
        if (this.settings.k5Compat()) {
            let imageType = 'none';
            if (json['zoom'] && json['zoom']['url']) {
                imageType = 'tiles';
            } else if (json['pdf'] && json['pdf']['url']) {
                imageType = 'pdf';
            } else {
                imageType = 'image/jpeg';
            }
            return {
                // licences: json['dnnt-labels'],
                licence: json['providedByLabel'],
                replicatedFrom: json['replicatedFrom'],
                imageType: imageType
            }
        } else {
            return {
                imageType: json['image'] ? json['image']['type'] : null,
                licence: json['providedByLicenses'] && json['providedByLicenses'].length > 0 ? json['providedByLicenses'][0] : null
            }
        }
    }







    // getSiblings(uuid: string) {
    //     const url = this.getItemUrl(uuid) + '/siblings';
    //     return this.doGet(url)
    //       .catch(this.handleError);
    // }


}

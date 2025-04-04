import { KrameriusInfo } from './../model/krameriusInfo.model';
import { PeriodicalQuery } from './../periodical/periodical_query.model';
import { SolrService } from './solr.service';
import { Utils } from './utils.service';
import { AppError } from './../common/errors/app-error';
import { NotFoundError } from './../common/errors/not-found-error';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { throwError } from 'rxjs';
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
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class KrameriusApiService {

    private static IIIF_BASE_URL = 'https://iiif.digitalniknihovna.cz';

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
    }

    private handleError(error: Response) {
        if (error.status === 404) {
            return throwError(new NotFoundError());
        } else if (error.status === 401 || error.status === 403) {
            return throwError(new UnauthorizedError());
        }
        return throwError(new AppError(error));
    }

    doGet(url: string): Observable<Object> {
        return this.http.get(encodeURI(url)).pipe(catchError(this.handleError));
    }

    private doGetText(url: string): Observable<string> {
        return this.http.get(encodeURI(url), { observe: 'response', responseType: 'text' })
            .pipe(map(response => response['body'], catchError(this.handleError)));
    }

    private doGetBlob(url: string): Observable<Blob> {
        return this.http.get(encodeURI(url), { observe: 'response', responseType: 'blob' })
            .pipe(map(response => response['body'], catchError(this.handleError)));
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

    getThumbStreamUrl(uuid: string): string {
        if (this.settings.k5Compat()) {
            return this.getItemUrl(uuid) + '/streams/IMG_THUMB';
        } else {
            return this.getItemUrl(uuid) + '/image/thumb';
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

    getSearchResults(query: string) {
        return this.doGet(this.getSearchResultsUrl(query));
    }

    getNumberOfRootsPages(root: string): Observable<number> {
        return this.getSearchResults(this.solr.buildNumberOfRootsPagesQuery(root))
            .pipe(map(response => this.solr.numberOfResults(response)));
    }

    getNewest(): Observable<DocumentItem[]> {
        return this.getSearchResults(this.solr.getNewestQuery())
            .pipe(map(response => this.solr.documentItems(response)));
    }

    getFulltextSearchAutocomplete(term: string, uuid: string): Observable<CompleterItem[]> {
        return this.getSearchResults(this.solr.buildFulltextSearchAutocompleteQuery(term, uuid))
            .pipe(map(response => this.solr.fulltextSearchAutocompleteResults(response)));
    }

    getSearchAutocomplete(term: string, query: SearchQuery, publicOnly: boolean): Observable<CompleterItem[]> {
        return this.getSearchResults(this.solr.buildSearchAutocompleteQuery(term, query, publicOnly))
            .pipe(map(response => this.solr.searchAutocompleteResults(response, term)));
    }


    getSearchAutocomplete2(term: string, query: SearchQuery, publicOnly: boolean): Observable<string[]> {
        return this.getSearchResults(this.solr.buildSearchAutocompleteQuery(term, query, publicOnly))
            .pipe(map(response => this.solr.searchAutocompleteResults2(response, term)));
    }

    getPeriodicalFulltext(periodicalUuid: string, volumeUuid: string, offset: number, limit: number, query: PeriodicalQuery, models: string[]): Observable<[PeriodicalFtItem[], number]> {
        return this.getSearchResults(this.solr.buildPeriodicalFulltextSearchQuery(periodicalUuid, volumeUuid, offset, limit, query, models))
            .pipe(map(response => [this.solr.periodicalFullTextItems(response, query.fulltext), this.solr.numberOfResults(response)] as [PeriodicalFtItem[], number]));
    }

    getPeriodicalItemsDetails(uuids: string[]): Observable<PeriodicalItem[]> {
        return this.getSearchResults(this.solr.buildPeriodicalItemsDetailsQuery(uuids))
            .pipe(map(response => this.solr.periodicalItemsDetails(response)));
    }

    getPeriodicalVolumes(uuid: string, query: PeriodicalQuery): Observable<PeriodicalItem[]> {
        return this.getSearchResults(this.solr.buildPeriodicalVolumesQuery(uuid, query))
            .pipe(map(response => this.solr.periodicalItems(response, 'periodicalvolume')));
    }

    getPeriodicalIssues(uuid: string, query: PeriodicalQuery): Observable<PeriodicalItem[]> {
        return this.getSearchResults(this.solr.buildPeriodicalIssuesQuery(uuid, query))
            .pipe(map(response => this.solr.periodicalItems(response, 'periodicalitem', uuid)));
    }

    getMonographUnits(uuid: string, query: PeriodicalQuery): Observable<DocumentItem[]> {
        return this.getSearchResults(this.solr.buildMonographUnitsQuery(uuid, query))
            .pipe(map(response => this.solr.monographUnits(response)));
    }

    getOmnibusUnits(uuid: string, query: PeriodicalQuery): Observable<DocumentItem[]> {
        return this.getSearchResults(this.solr.buildOmnibusUnitsQuery(uuid, query))
            .pipe(map(response => this.solr.omnibusUnits(response)));
    }

    getBrowseItems(query: BrowseQuery): Observable<[BrowseItem[], number]> {
        return this.getSearchResults(this.solr.buildBrowseQuery(query))
            .pipe(map(response => this.solr.browseItems(response, query)));
    }

    getDocumentFulltextPage(uuids: string[], query: string): Observable<string[]> {
        return this.getSearchResults(this.solr.buildDocumentFulltextQuery(uuids, query))
            .pipe(map(response => this.solr.documentFulltextQuery(response)));
    }

    getMetadata(uuid: string, type: string = 'full'): Observable<Metadata> {
        const id: string = uuid.split("/").slice(-1)[0];
        return this.getMods(uuid).pipe(map(mods => this.mods.parse(mods, id, type)));
    }

    getItem(uuid: string, forceIndex = false): Observable<DocumentItem> {
        if (this.settings.k5Compat() && !forceIndex) {
            return this.doGet(this.getItemUrl(uuid)).pipe(map(response => this.utils.parseItem(response)));
        } else {
            return this.getSearchResults(this.solr.buildDocumentQuery(uuid)).pipe(map(response => {
                const item = this.solr.documentItem(response);
                if (item == null) {
                    throw new NotFoundError();
                } else {
                    return item;
                }
             }));
        }
    }

    getFoxmlUrl(uuid: string): string {
        return this.getItemUrl(uuid) + '/foxml';
    }

    getFoxml(uuid: string): Observable<string> {
        return this.doGetText(this.getFoxmlUrl(uuid));
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

    getMods(uuid: string): Observable<string> {
        return this.doGetText(this.getModsUrl(uuid));
    }

    getDc(uuid: string) {
        return this.doGetText(this.getDcUrl(uuid));
    }

    getZoomifyBaseUrl(uuid: string): string {
        if (this.settings.k5Compat()) {
            return this.getbaseUrl() + '/search/zoomify/' + uuid;
        } else {
            return this.getItemUrl(uuid) + '/image/zoomify';
        }
    }

    getIiifBaseUrl(uuid: string): string {
        let baseUrl = this.getbaseUrl();
        if (this.settings.replaceImageUrl) {
            baseUrl = baseUrl.replace(this.settings.url, this.settings.replaceImageUrl);
        }
        return baseUrl + '/search/iiif/' + uuid;
    }

    getIiifPresentationUrl(uuid: string): string {
        return `${KrameriusApiService.IIIF_BASE_URL}/${this.settings.code}/${uuid}`;
    }

    getIiifPresentation(uuid: string): Observable<any> {
        return this.doGet(this.getIiifPresentationUrl(uuid));
    }

    getModsUrl(uuid: string): string {
        if (this.settings.k5Compat()) {
            return this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_MODS);
        } else {
            return this.getItemUrl(uuid) + '/metadata/mods';
        }
    }

    getDcUrl(uuid: string): string{
        if (this.settings.k5Compat()) {
            return this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_DC);
        } else {
            return this.getItemUrl(uuid) + '/metadata/dc';
        }
    }

    getSearchResultsUrl(query: string): string {
        return this.getApiUrl() + '/search?' + query;
    }

    getUserInfo(username: string, password: string): Observable<User> {
        const url = this.getApiUrl() + '/user?sessionAttributes=true';
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
            .pipe(map(response => User.fromJson(response)));
    }

    getRights(pid: String): Observable<string[]> {
        const url = `${this.getApiUrl()}/user/actions?pid=${pid}`;
        return this.http.get(url)
            .pipe(map(response => response["actions"]));
    }

    auth(username: string, password: string): Observable<string> {
        const url = this.getK7AuthUrl();
        const body = `username=${username}&password=${password}`;
        return this.http.post(url, body).pipe(map(response => response['access_token']));
    }

    getToken(code: string, redirectUri: string): Observable<string> {
        const url =  `${this.getApiUrl()}/user/auth/token?code=${code}&redirect_uri=${redirectUri}`;
        return this.http.get(url).pipe(map(response => response['access_token']));
    }

    getK7LoginUrl(redirectUrl: string): string {
        return `${this.getApiUrl()}/user/auth/login?redirect_uri=${redirectUrl}`;
    }

    getK7LogoutUrl(redirectUrl: string): string {
        return `${this.getApiUrl()}/user/auth/logout?redirect_uri=${redirectUrl}`;
    }

    logout() {
        const url = this.getApiUrl() + '/user/logout';
        return this.http.get(url).pipe(catchError(this.handleError));
    }

    getRecommended() {
        const url = this.getApiUrl() + '/feed/custom';
        return this.doGet(url)
            .pipe(map(response => this.utils.parseRecommended(response)));
    }

    getCollections() {
        const url = this.getApiUrl() + '/vc';
        return this.doGet(url)
            .pipe(map(response => response));
    }

    getColletionCuttings(uuid: string):  Observable<any> {
        const url = this.getItemUrl(uuid) + '/collection/cuttings';
        return this.doGet(url);
    }

    getKrameriusInfo(language: string): Observable<KrameriusInfo> {
        const url = this.getApiUrl() + '/info?language=' + language;
        return this.doGet(url)
            .pipe(map(response => KrameriusInfo.fromJson(response)));
    }

    getPdfUrl(uuid: string): string {
        if (this.settings.k5Compat()) {
            return this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_JPEG);
        } else {
            return this.getItemUrl(uuid) + '/image';
        }
    }

    getEpubUrl(uuid: string): string {
        return this.getItemUrl(uuid) + '/epub/';
    }

    getMp3Url(uuid: string): string {
        if (this.settings.k5Compat()) {
            return this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_MP3);
        } else {
            return this.getItemUrl(uuid) + '/audio/mp3';
        }
    }

    getMp3Object(uuid: string): Observable<HTMLAudioElement> {
        const url = this.getMp3Url(uuid);
        const token = this.settings.getToken();
        const headers = new HttpHeaders();
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        const clientId = this.settings.getClientId();
        if (clientId) {
            headers.set('Client', clientId);
        }
        return this.http.get(url, { headers, responseType: 'blob' }).pipe(
            map(blob => {
                const blobUrl = URL.createObjectURL(blob);
                return new Audio(blobUrl);
            }
        ));
    }

    downloadMp3(uuid: string): Observable<Blob> {
        return this.doGetBlob(this.getMp3Url(uuid));
    }

    getPdfPreviewBlob(uuid: string): Observable<boolean> {
        if (this.settings.k5Compat()) {
            return this.doGetBlob(this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_PREVIEW)).pipe(map(() => true));
        } else {
            return this.doGetBlob(this.getItemUrl(uuid) + '/image').pipe(map(() => true));
        }
    }


    getEpubFileFromUrl(uuid: string): Observable<File> {
        let blob: Observable<Blob>;
        if (this.settings.k5Compat()) {
            blob = this.doGetBlob(this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_JPEG));
        } else {
            blob = this.doGetBlob(this.getItemUrl(uuid) + '/image')
        }
        return blob.pipe(map((blobData) => {
            const file = new File([blobData], 'image.epub', {
                type: "application/epub+zip",
            });
            return file;
        }));
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

    downloadFile(url: string) {
        return this.doGetBlob(url);
    }


    getChildren(uuid: string, source: string = null, own: boolean = true): Observable<any> {
        return this.getSearchResults(this.solr.buildBookChildrenQuery(uuid, source, own))
            .pipe(map(response => this.solr.bookChildItems(response)));
    }


    getRawChildren(uuid: string): Observable<any> {
        if (this.settings.k5Compat()) {
            return this.doGet(this.getItemUrl(uuid) + '/children');
        } else {
            return this.getSearchResults(this.solr.buildBookChildrenQuery(uuid, null, true));
        }
    }


    getRawItem(uuid: string): Observable<any> {
        const url = this.getItemUrl(uuid);
        return this.doGet(url);
    }


    refreshLock(hash: string): Observable<any> {
        const url = this.getApiUrl() + '/locks/' + hash + '/refresh';
        return this.doGet(url)
                .pipe(map(response => {
                    console.log(response);
                }));
    }


    getItemInfo(uuid: string): Observable<any> {
        if (this.settings.k5Compat()) {
            return this.doGet(this.getItemUrl(uuid))
                .pipe(map(response => this.parseItemInfoForPage(response)));
        } else {
            let url = this.getItemUrl(uuid) + '/info';
            if (this.settings.replaceImageUrl) {
                url = url.replace(this.settings.url, this.settings.replaceImageUrl);
            }
            return this.doGet(url)
                .pipe(map(response => this.parseItemInfoForPage(response)));
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
                licence: json['providedByLabel'],
                replicatedFrom: json['replicatedFrom'],
                imageType: imageType
            }
        } else {
            let lockHash = '';
            if (json['accessibleLocks'] && json['accessibleLocks'].length > 0) {
                lockHash = json['accessibleLocks'][0]['hash'];
            }
            if (json)
            return {
                imageType: json['image'] ? json['image']['type'] : null,
                licence: json['providedByLicenses'] && json['providedByLicenses'].length > 0 ? json['providedByLicenses'][0] : null,
                lockHash: lockHash ? lockHash : null,
            }
        }
    }

    // FOLDERS

    private getFoldersUrl(path: string): string {
        return this.getApiUrl() + '/folders/' + path;
    }

    getFolders() {
        const url = this.getFoldersUrl('');
        return this.doGet(url);
    }
    getFolder(uuid: string): Observable<any> {
        const url = this.getFoldersUrl(uuid);
        return this.doGet(url);
    }
    getFolderItems(uuid: string) {
        const url = this.getFoldersUrl(uuid + '/items');
        return this.doGet(url);
    }
    createNewFolder(name: string): Observable<any> {
        const url = this.getFoldersUrl('');
        let body = {"name": name};
        return this.http.post<any>(url, body)
    }
    deleteFolder(uuid: string): Observable<any> {
        const url = this.getFoldersUrl(uuid);
        return this.http.delete<any>(url)
    }
    editFolder(uuid: string, name: string): Observable<any> {
        const url = this.getFoldersUrl(uuid);
        let body = {"name": name};
        return this.http.put<any>(url, body)
    }
    followFolder(uuid: string): Observable<any> {
        const url = this.getFoldersUrl(uuid + '/follow');
        return this.http.post<any>(url, {})
    }
    unfollowFolder(uuid: string): Observable<any> {
        const url = this.getFoldersUrl(uuid + '/unfollow');
        return this.http.post<any>(url, {})
    }
    addItemToFolder(uuid: string, items: any): Observable<any> {
        const url = this.getFoldersUrl(uuid + '/items');
        let body = {"items": items};
        return this.http.put<any>(url, body)
    }
    removeItemFromFolder(uuid: string, items: any[]): Observable<any> {
        const url = this.getFoldersUrl(uuid + '/items');
        let body = {"items": items};
        return this.http.delete<any>(url, {body: body})
    }

}

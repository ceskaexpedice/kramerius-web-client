import { KrameriusInfo } from './../model/krameriusInfo.model';
import { PeriodicalQuery } from './../periodical/periodical_query.model';
import { BrowseQuery } from './../browse/browse_query.model';
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
import { Page } from '../model/page.model';

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
        private solrService: SolrService) {
    }

    private getbaseUrl(): string {
        return this.settings.url;
    }

    private getApiUrl(): string {
        return this.getbaseUrl() + '/search/api/v5.0';
    }

    private getApiUrlForKramerius(url: string): string {
        return url + '/search/api/v5.0';
    }



    private handleError(error: Response) {
        if (error.status === 404) {
            return throwError(new NotFoundError());
        } else if (error.status === 401 || error.status === 403) {
            return throwError(new UnauthorizedError());
        }
        return throwError(new AppError(error));
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

    getBrowseResults(query: BrowseQuery) {
        const url = this.getApiUrl() + '/search?'
            + query.buildQuery();
        return this.doGet(url)
            .catch(this.handleError);
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
            .map(response => User.fromJson(response, username, password))
            .catch(this.handleError);
    }


    logout() {
        const url = this.getApiUrl() + '/user/logout';
        return this.http.get(url).catch(this.handleError);
    }



    getNewest() {
        const url = `${this.getApiUrl()}/search?fl=PID,dostupnost,dc.creator,dc.title,datum_str,fedora.model,img_full_mime&q=dostupnost:public&fq=${this.settings.topLevelFilter}&sort=created_date desc&rows=24&start=0`;
        return this.doGet(url)
            .map(response => this.solrService.documentItems(response))
            .catch(this.handleError);
    }

    getFulltextUuidList(uuid, query) {
        let text = query.toLowerCase().trim();
        const inQuotes = text.startsWith('"') && text.endsWith('"');
        if (!inQuotes) {
            text = text.replace(/"/g, '\\"');
        }
        text = text.replace(/~/g, '\\~')
        .replace(/:/g, '\\:').replace(/-/g, '\\-').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/!/g, '\\!');
        const url = this.getApiUrl() + '/search/?fl=PID&q=parent_pid:"'
            + uuid + '"'
            + ' AND fedora.model:page'
            + ' AND text:'
            + text
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

    getKrameriusInfo(language: string): Observable<KrameriusInfo> {
        const url = this.getApiUrl() + '/info?language=' + language;
        return this.doGet(url)
            .map(response => KrameriusInfo.fromJson(response))
            .catch(this.handleError);
    }


    private getPeriodicalItems(pidPath: string, level: number, models: string[], query: PeriodicalQuery, applyYear: boolean) {
        const modelRestriction = models.map(a => 'fedora.model:' + a).join(' OR ');
        let url = this.getApiUrl() + '/search?fl=PID,dostupnost,fedora.model,dc.title,datum_str,details'
        if (this.settings.dnntFilter) {
            url += ',dnnt';
        }
        url += '&q=pid_path:'
                + pidPath.toLowerCase() + '/* AND level:' + level + ' AND (' + modelRestriction + ')';
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
        }
        const text = query.fulltext.toLowerCase().trim()
                        .replace(/"/g, '\\"').replace(/~/g, '\\~')
                        .replace(/:/g, '\\:').replace(/-/g, '\\-').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/!/g, '\\!');
        url += ' AND (fedora.model:article || fedora.model:monographunit || fedora.model:page) AND text:' + text;
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


    getSearchAutocompleteUrl(term: string, fq: string = null): string {
        const searchField = this.settings.lemmatization ? 'title_lemmatized_ascii' : 'dc.title';
        const query = term.toLowerCase().trim()
                        .replace(/"/g, '\\"').replace(/~/g, '\\~')
                        .replace(/:/g, '\\:').replace(/-/g, '\\-').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/!/g, '\\!')
                        .split(' ').join(' AND ' + searchField + ':');
        let result = this.getApiUrl() + '/search?defType=edismax&fl=PID,dc.title,score&q='
        if (this.settings.lemmatization) {
            result += '((' + searchField + ':'  + query;
            if (!term.endsWith(' ') && !term.endsWith(':')) {
                result += ') OR (' + searchField + ':'  + query + '*))';
            } else {
                result += '))';
            }
        } else {
            result += '' + searchField + ':'  + query;
            if (!term.endsWith(' ') && !term.endsWith(':')) {
                result += '*';
            }
        }
        result += ' AND (' + this.settings.topLevelFilter + ')';
        if (fq) {
            result += '&fq=' + fq;
        }
        result += '&bq=fedora.model:monograph^5&bq=fedora.model:periodical^5&bq=dostupnost:public^5';
        result += '&rows=50';
        return result;
    }

    getDocumentSearchAutocompleteUrl(term: string, uuid: string): string {
        const query = term.toLowerCase().trim() + '*';
        const result = this.getApiUrl() + `/search/?fl=PID&hl=true&hl.fl=text_ocr&hl.fragsize=1&hl.simple.post=<<&hl.simple.pre=>>&hl.snippets=10&q=parent_pid:"${uuid}"+AND+text_ocr:${query}&rows=20`;
        return result;
    }

    getSearchAutocomplete(term: string, fq: string = null): Observable<any[]> {
        const url = this.getSearchAutocompleteUrl(term, fq);
        return this.doGet(url)
            .map(res => <any> res['response']['docs'])
          .catch(this.handleError);
    }

    getDocumentSearchAutocomplete(term: string, uuid: string): Observable<any[]> {
        const url = this.getDocumentSearchAutocompleteUrl(term, uuid);
        return this.doGet(url)
            .map(res => <any> res)
          .catch(this.handleError);
    }


    // getThumbUrl(uuid: string) {
    //     return this.getItemUrl(uuid) + '/thumb';
    // }

    // getThumbUrlForKramerius(uuid: string, url: string) {
    //     return this.getItemUrlForKramerius(uuid, url) + '/thumb';
    // }

    getThumbUrl(uuid: string) {
        return this.getbaseUrl() + `/search/img?pid=${uuid}&stream=IMG_THUMB&action=GETRAW`;
    }

    getThumbUrlForKramerius(uuid: string, url: string) {
        return url + `/search/img?pid=${uuid}&stream=IMG_THUMB&action=GETRAW`;
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

    getOcr(uuid: string): Observable<string> {
        const url = this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_OCR);
        return this.doGetText(url)
            .catch(this.handleError);
    }

    getDc(uuid: string) {
        const url = this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_DC);
        return this.doGetText(url)
          .catch(this.handleError);
    }

    getAlto(uuid: string) {
        const url = this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_ALTO);
        return this.doGetText(url)
          .catch(this.handleError);
    }

    getMods(uuid: string): Observable<string> {
        const url = this.getItemStreamUrl(uuid, KrameriusApiService.STREAM_MODS);
        return this.doGetText(url)
          .catch(this.handleError);
    }

    getFoxml(uuid: string): Observable<string> {
        const url = this.getItemUrl(uuid) + '/foxml';
        return this.doGetText(url)
          .catch(this.handleError);
    }

    getChildren(uuid: string): Observable<any[]> {
        const url = this.getItemUrl(uuid) + '/children';
        return this.doGet(url)
            .map(res => <any[]> res)
          .catch(this.handleError);
    }

    getIiifPresentation(uuid: string): Observable<any> {
        const url = this.getbaseUrl() + '/search/iiif-presentation/' + uuid + '/manifest';
        return this.doGet(url)
          .catch(this.handleError);
    }

    getZoomifyBaseUrl(uuid: string): string {
        return this.getbaseUrl() + '/search/zoomify/' + uuid;
    }

    getIiifBaseUrl(uuid: string): string {
        return this.getbaseUrl() + '/search/iiif/' + uuid;
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

    getRawItem(uuid: string) {
        const url = this.getItemUrl(uuid);
        return this.doGet(url)
        .catch(this.handleError);
    }

}


import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';

@Injectable()
export class CitationService {

    constructor(private http: HttpClient, private appSettings: AppSettings, private translate: TranslateService) {
    }

    getCitation(uuid: string): Observable<string> {
        const lang = this.translate.currentLang;
        const url = `https://citace.kramerius.cloud/v1/kramerius?url=${this.appSettings.url}&uuid=${uuid}&format=html&lang=${lang}}&k7=${this.appSettings.k7}`;
        return this.doGetText(url);
    }

    private doGetText(url: string): Observable<string> {
        return this.http.get(encodeURI(url), { observe: 'response', responseType: 'text' })
        .pipe(map(response => response['body']));
    }

}

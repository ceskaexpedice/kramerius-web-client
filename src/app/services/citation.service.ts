
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';

@Injectable()
export class CitationService {

    constructor(private http: HttpClient, private settings: AppSettings, private translate: TranslateService) {
    }

    // getCitationOld(uuid: string): Observable<string> {
    //     const lang = this.translate.currentLang;
    //     const url = `${this.appSettings.citationServiceUrl}/v1/kramerius?url=${this.appSettings.url}&uuid=${uuid}&format=html&lang=${lang}&k7=${this.appSettings.version >= 7}`;
    //     return this.doGetText(url);
    // }

    // getCitationNew(uuid: string): Observable<string> {
    //     const lang = this.translate.currentLang;
    //     const url = `${this.appSettings.citationService}/api/v1?url=${this.appSettings.url}&uuid=${uuid}&exp=iso690&format=html&lang=${lang}`;
    //     return this.doGetText(url);
    // }

    getCitation(uuid: string, callback: (citation: string) => void) {
        let type  = this.settings.citationServiceType;
        if (this.settings.k5Compat()) {
            type = 'old';
        }
        const lang = this.translate.currentLang;
        let url = '';
        if (type == 'old' || type == 'both') {
            url = `${this.settings.citationServiceUrl}/v1/kramerius?url=${this.settings.url}&uuid=${uuid}&format=html&lang=${lang}&k7=${this.settings.version >= 7}`;
        } else if (type == 'new') {
            url = `${this.settings.citationService}/api/v1?url=${this.settings.url}&uuid=${uuid}&exp=iso690&format=html&lang=${lang}`;
        }
        return this.doGetText(url).subscribe((response: string) => {
            if (type == 'both') {
                const url2 = `${this.settings.citationService}/api/v1?url=${this.settings.url}&uuid=${uuid}&exp=iso690&format=html&lang=${lang}`;
                this.doGetText(url2).subscribe((response2: string) => {
                    callback(response + '<br/><br/>' + response2);
                });
            } else {
                callback(response);
            }
        });
    }

    private doGetText(url: string): Observable<string> {
        return this.http.get(encodeURI(url), { observe: 'response', responseType: 'text' })
        .pipe(map(response => response['body']));
    }

}

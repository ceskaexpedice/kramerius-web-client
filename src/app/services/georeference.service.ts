
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';

@Injectable()
export class GeoreferenceService {

    constructor(private http: HttpClient, private appSettings: AppSettings, private translate: TranslateService) {
    }

    getGeoreference(uuid: string): Observable<any> {
        const l = uuid.length;
        const url = 'geo/uuid/' + uuid.substring(l - 2) + '/' + uuid.substring(l - 4, l - 2) + '/' + uuid.substring(5) + '.json';
        return this.http.get(url);
    }

    

}


import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class GeoreferenceService {

    constructor(private http: HttpClient) {
    }

    getGeoreference(uuid: string): Observable<any> {
        const l = uuid.length;
        const urlPrefix = 'https://staremapy.cz/data/';
        const url = urlPrefix + 'uuid/' + uuid.substring(l - 2) + '/' + uuid.substring(l - 4, l - 2) + '/' + uuid.substring(5) + '.json';
        return this.http.get(url);
    }


}

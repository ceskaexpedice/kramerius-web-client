
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class MakariusService {

    constructor(private http: HttpClient) {
    }

    getSimilarPages(uuid: string): Observable<any> {
        const url = `https://api2.makarius.trinera.cloud/mak-similarity-service/api/search/similar?pageId=MZK_K7:${uuid}&limit=50&filterDigLib=MZK_K7`;
        return this.http.get(url);
    }


}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from './app-settings';
import { map } from 'rxjs/operators';

@Injectable()
export class AdminApiService {

  constructor(private http: HttpClient, private appSettings: AppSettings) {
  }

  getBaseUrl(): string {
    return `${this.appSettings.url}/search/api/admin/v7.0`;
  }

  private doGet(path: string, params, type = 'json'): Observable<Object> {
    const options = {
      params: params
    };
    if (type === 'text') {
      options['responseType'] = 'text';
      options['observe'] = 'response';
    }
    return this.http.get(this.getBaseUrl() + path, options);
  }

  private get(path: string, params = {}): Observable<Object> {
    return this.doGet(path, params);
  }

  private getText(path: string, params = {}): Observable<string> {
    return this.doGet(path, params, 'text').pipe(map(response => response['body']));
  }

  private post(path: string, body, options = {}): Observable<Object> {
    return this.http.post(this.getBaseUrl() + path, body, options);
  }

  private delete(path: string): Observable<Object> {
    return this.http.delete(this.getBaseUrl() + path, {});
  }

  private put(path: string, body: any, options: any = {}): Observable<Object> {
    return this.http.put(this.getBaseUrl() + path, body, options);
  }

  addItemsToCollection(collectionPid: string, itemPids: string[]): Observable<Object> {
    return this.post(`/collections/${collectionPid}/items`, itemPids);
  }
  
  addItemToCollection(collectionPid: string, itemPid: string): Observable<Object> {
    return this.post(`/collections/${collectionPid}/items`, itemPid);
  }

  removeItemFromCollection(collectionPid: string, itemPid: string): Observable<Object> {
    return this.delete(`/collections/${collectionPid}/items/${itemPid}`);
  }

  getCollections(): Observable<any> {
    return this.get(`/collections`);
  }

  changeAccessibility(uuid: string, scope: string, accessibility: string): Observable<any> {
    const payload = {
      defid: 'set_policy',
      params: {
        scope: scope,
        policy: accessibility,
        pid: uuid
      }
    }
    return this.post('/processes/', payload);
  }

  reindex(uuid: string, type: string): Observable<any> {
    const payload = {
      defid: 'new_indexer_index_object',
      params: {
        type: type,
        pid: uuid,
        ignoreInconsistentObjects: true
      }
    }
    return this.post('/processes/', payload);
  }

  setReprePage(forObject: string, fromPage: string): Observable<Object> {
    return this.put(`/items/${forObject}/streams/IMG_THUMB?srcPid=${fromPage}`, {});
  }


}


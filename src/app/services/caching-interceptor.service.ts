import { Injectable } from '@angular/core';
import { HttpEvent, HttpRequest, HttpResponse, HttpInterceptor, HttpHandler } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { startWith, tap } from 'rxjs/operators';
import 'rxjs/add/observable/of';

import { HttpRequestCache } from './http-request-cache.service';

@Injectable()
export class CachingInterceptor implements HttpInterceptor {
  constructor(private cache: HttpRequestCache) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const cachedResponse = this.cache.get(req);
    return cachedResponse ? Observable.of(cachedResponse) : this.sendRequest(req, next, this.cache);
  }

  sendRequest(
    req: HttpRequest<any>,
    next: HttpHandler,
    cache: HttpRequestCache): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          cache.put(req, event);
        }
      })
    );
  }
}

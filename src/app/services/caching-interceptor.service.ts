import { Injectable } from '@angular/core';
import { HttpEvent, HttpRequest, HttpResponse, HttpInterceptor, HttpHandler } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpRequestCache } from './http-request-cache.service';
import { AdminApiService } from './admin-api.service';

@Injectable()
export class CachingInterceptor implements HttpInterceptor {
  constructor(private cache: HttpRequestCache, 
    private adminApi: AdminApiService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (req.url.startsWith(this.adminApi.getBaseUrl())) {
      return next.handle(req);
    }
    const cachedResponse = this.cache.get(req);
    return cachedResponse ? of(cachedResponse) : this.sendRequest(req, next, this.cache);
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

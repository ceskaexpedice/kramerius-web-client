import { environment } from './../../environments/environment.prod';
import { AppSettings } from './app-settings';
import { Injectable } from '@angular/core';
import { HttpEvent, HttpRequest, HttpResponse, HttpInterceptor, HttpHandler } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpRequestCache } from './http-request-cache.service';
import { AngularTokenService } from 'angular-token';

@Injectable()
export class CachingInterceptor implements HttpInterceptor {
  constructor(private cache: HttpRequestCache, 
    private tokenService: AngularTokenService,
    private appSettings: AppSettings) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (environment.cloudApiBase && req.url.startsWith(environment.cloudApiBase)) {
      return next.handle(req);
    }
    if (req.url.startsWith(this.appSettings.adminApiBaseUrl)) {
      const data = this.tokenService.currentAuthData;
      if (data) {
        req = req.clone({
          setHeaders: {
            'access-token': data.accessToken,
            'uid': data.uid,
            'client': data.client
          }
        });
      }
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

import { Injectable } from '@angular/core';
import { HttpEvent, HttpRequest, HttpInterceptor, HttpHandler } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettings } from './app-settings';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private settings: AppSettings) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!request.url.startsWith(this.settings.url)) {
      return next.handle(request);
    }
    const token = this.settings.getToken();
    const clientId = this.settings.getClientId();
    if (!token && !clientId) {
      return next.handle(request);
    }
    let headers = request.headers;
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    if (clientId) {
      headers = headers.set('Client', clientId);
    }
    const newRequest = request.clone({ headers });
    return next.handle(newRequest);
  }
}

import { Injectable } from '@angular/core';
import { HttpEvent, HttpRequest, HttpInterceptor, HttpHandler } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppSettings } from './app-settings';
import { LocalStorageService } from './local-storage.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private locals: LocalStorageService, private settings: AppSettings) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!request.url.startsWith(this.settings.url) || request.url.startsWith("https://tomcat.kramerius.trinera.cloud/kramerius-folders")) {
    // if (!request.url.startsWith(this.settings.url)) {
      return next.handle(request);
    }
    // console.log('intercepting', request.url);
    const token = this.settings.getToken();
    if (token) {
      request = request.clone({
        setHeaders: {
          'Authorization': 'Bearer ' + token
        }
      });
    }
    return next.handle(request);
  }
}

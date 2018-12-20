import { Injectable } from '@angular/core';
import { HttpEvent, HttpRequest, HttpInterceptor, HttpHandler } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const user = this.authService.user;
    if (user) {
      request = request.clone({
        setHeaders: {
          'Authorization': 'Basic ' + btoa(user.username + ':' + user.password)
        }
        // ,
        // withCredentials: true
      });
    }
    return next.handle(request);
  }
}

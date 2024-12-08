import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: any;

  constructor(private http: HttpClient) {}

  // Load configuration
  loadConfig(): Observable<any> {
    return this.http.get('/assets/shared/config.json').pipe(
      tap((config) => (this.config = config))
    );
  }

  // Get a configuration value
  getConfig(key: string): any {
    return this.config ? this.config[key] : null;
  }
}
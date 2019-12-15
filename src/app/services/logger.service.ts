import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class LoggerService {

  private logInfo: boolean;
  private logError: boolean;

  constructor() {
    this.logInfo = !environment.production;
    this.logError = true;
  }

  info(message?: any, ...optionalParams: any[]) {
    if (this.logInfo) {
      console.log(message, optionalParams);
    }
  }

  errror(message?: any, ...optionalParams: any[]) {
    if (this.logError) {
      console.error(message, optionalParams);
    }
  }

}

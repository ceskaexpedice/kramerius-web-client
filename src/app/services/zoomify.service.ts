import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';

@Injectable()
export class ZoomifyService {

  constructor(private logger: LoggerService) {
  }

  properties(url: string): string {
    return `${url}/ImageProperties.xml`;
  }

  parseProperties(data: string) {
    this.logger.info('data', data);
    const a = data.toLowerCase().split('"');
    const width = parseInt(a[1], 10);
    const height = parseInt(a[3], 10);
    return {
      width: width,
      height: height
    }
  }

  thumb(url): string {
    return `${url}/TileGroup0/0-0-0.jpg`;
  }


}

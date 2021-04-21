import { Injectable } from '@angular/core';

@Injectable()
export class IiifService {

  constructor() {
  }

  imageCrop(url: string, x1: number, y1: number, x2: number, y2: number) {
    if (x1 < 0) {
        x1 = 0;
    }
    if (x2 < 0) {
        if (x1 === 0) {
            return;
        }
        x2 = 0;
    }
    if (y1 > 0) {
        y1 = 0;
    }
    if (y2 > 0) {
        if (y1 === 0) {
            return;
        }
        y2 = 0;
    }
    const a = Math.max(Math.round(x1), 0);
    const b = Math.round(Math.abs(y2));
    const c = Math.max(Math.round(x2 - x1), 0);
    const d = Math.max(Math.round(Math.abs(y1) - Math.abs(y2)), 0);
    return `${url}/${a},${b},${c},${d}/max/0/default.jpg`;
  }


  image(url: string, width: number, height: number): string {
    return `${url}/full/${width},${height}/0/default.jpg`;
  }

  imageManifest(url: string): string {
    return `${url}/info.json`;
  }

}

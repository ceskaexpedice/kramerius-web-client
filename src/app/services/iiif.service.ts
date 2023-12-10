import { Injectable } from '@angular/core';

@Injectable()
export class IiifService {

  constructor() {
  }

  xywh(x1: number, y1: number, x2: number, y2: number): string {
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
    return `${a},${b},${c},${d}`;
  }

  imageCrop(url: string, x1: number, y1: number, x2: number, y2: number) {
    return `${url}/${this.xywh(x1,y1,x2,y2)}/max/0/default.jpg`;
  }



  getIiifImage(url:string): string {
    return `${url}/full/max/0/default.jpg`;
  }

  imageManifest(url: string): string {
    return `${url}/info.json`;
  }

}

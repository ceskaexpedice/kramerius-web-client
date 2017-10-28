import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Injectable } from '@angular/core';


@Injectable()
export class ViewerControlsService {

    private listners = new Subject<any>();

    viewerActions(): Observable<ViewerActions> {
        return this.listners.asObservable();
    }

    zoomIn() {
        this.listners.next(ViewerActions.zoomIn);
    }

    zoomOut() {
        this.listners.next(ViewerActions.zoomOut);
    }

    rotateRight() {
        this.listners.next(ViewerActions.rotateRight);
    }

    rotateLeft() {
        this.listners.next(ViewerActions.rotateLeft);
    }

    fitToScreen() {
        this.listners.next(ViewerActions.fitToScreen);
    }

}


export enum ViewerActions {
    none = 0,
    zoomIn = 1,
    zoomOut = 2,
    rotateLeft = 3,
    rotateRight = 4,
    fitToScreen = 5,
}

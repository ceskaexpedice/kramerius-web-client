import { ViewerImageType } from '../services/book.service';

export class Page {

    loaded = false;
    uuid: string;
    supplementUuid: string;
    type: string;
    number: string;
    index: number;
    thumb: string;
    hidden: boolean;
    selected = false;
    iiif: string;
    zoomify: string;
    pdf: string;
    position = PagePosition.None;
    imageType = PageImageType.None;

    providedByDnnt = false;
    dnntFlag = false;

    originUrl: string;
    public: boolean;


    constructor() {
    }

    public assignPageData(data, iiifEnabled: boolean) {
        if (!data) {
            return;
        }
        this.loaded = true;
        if (data['dnnt']) {
            this.dnntFlag = true;
        }
        if (data['providedByDnnt']) {
            this.providedByDnnt = true;
        }
        if (data['replicatedFrom'] && data['replicatedFrom'].length > 0) {
            this.originUrl = data['replicatedFrom'][0];
        }
        if (iiifEnabled && data['iiif']) {
            this.iiif = data['iiif'];
        }
        if (data['zoom'] && data['zoom']['url']) {
            if (data['zoom']['type'] === 'zoomify') {
                this.zoomify = data['zoom']['url'];
            } else  if (data['zoom']['type'] === 'deepzoom') {
                this.zoomify = data['zoom']['url'].replace('deepZoom', 'zoomify');
            }
        }
        if (this.iiif) {
            this.imageType = PageImageType.IIIF;
            return;
        } 
        if (this.zoomify) {
            this.imageType = PageImageType.ZOOMIFY;
            return;
        } 
        if (data['pdf'] && data['pdf']['url']) {
            this.imageType = PageImageType.PDF;
            this.pdf = data['pdf']['url'];
            return;
        } else {
            this.imageType = PageImageType.JPEG;
        }
    }

    public viewable() {
        return this.imageType === PageImageType.IIIF || this.imageType === PageImageType.ZOOMIFY || this.imageType === PageImageType.JPEG;
    }

    public clear() {
        this.zoomify = null;
        this.iiif = null;
        this.pdf = null;
        this.loaded = false;
        this.imageType = PageImageType.None;
    }

    public getImageUrl(): string {
        switch(this.imageType) {
            case PageImageType.IIIF: return this.iiif;
            case PageImageType.ZOOMIFY: return this.zoomify;
        }
    }

    public getViewerImageType(): ViewerImageType {
        switch(this.imageType) {
            case PageImageType.IIIF: return ViewerImageType.IIIF;
            case PageImageType.JPEG: return ViewerImageType.JPEG;
            case PageImageType.ZOOMIFY: return ViewerImageType.ZOOMIFY;
        }
    }
}


export enum PagePosition {
    Single, None, Left, Right
}

export enum PageImageType {
    ZOOMIFY, IIIF, PDF, JPEG, None
}

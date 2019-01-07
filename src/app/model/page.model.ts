export class Page {

    // Page Properties
    uuid: string;
    policy: string;
    type: string;
    number: string;
    index: number;
    thumb: string;
    hidden: boolean;
    selected = false;
    position = PagePosition.None;
    imageType = PageImageType.None;

    providedByDnnt = false;
    dnntFlag = false;

    // Image Properties
    width: number = -1;
    height: number = -1;
    url: string;
    altoBoxes: any[];

    constructor() {

    }

    public assignZoomifyData(data: string) {
        const a = data.toLowerCase().split('"');
        const width = parseInt(a[1], 10);
        const height = parseInt(a[3], 10);
        this.width = width;
        this.height = height;
    }

    public assignJpegData(width, height, url) {
        this.width = width;
        this.height = height;
        this.url = url;
    }

    public cached() {
        return this.imageType === PageImageType.PDF
           || (this.imageType !== PageImageType.None && this.url && this.height > -1 && this.width > -1);
    }

    public assignPageData(data) {
        if (!data) {
            return;
        }
        if (data['dnnt']) {
            this.dnntFlag = true;
        }
        if (data['providedByDnnt']) {
            this.providedByDnnt = true;
        }
        if (data['zoom'] && data['zoom']['url']) {
            this.imageType = PageImageType.ZOOMIFY;
            this.url = data['zoom']['url'] + '/';
            return;
        }
        if (data['pdf'] && data['pdf']['url']) {
            this.imageType = PageImageType.PDF;
            this.url = data['pdf']['url'];
            return;
        } else {
            this.imageType = PageImageType.JPEG;
        }
    }

    public clear() {
        this.height = -1;
        this.width = -1;
        this.url = null;
        this.imageType = PageImageType.None;
    }

}


export enum PagePosition {
    Single, None, Left, Right
}

export enum PageImageType {
    ZOOMIFY, IIIF, PDF, JPEG, None
}


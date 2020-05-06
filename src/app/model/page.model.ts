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
    pdf: string;
    position = PagePosition.None;
    imageType = PageImageType.None;
    providedByDnnt = false;
    dnntFlag = false;
    originUrl: string;
    public: boolean;
    title: string;

    constructor() {
    }

    setTitle(title: string) {
        title = title.trim();
        if (this.number.trim() != title) {
            this.title = title;
        }
    }

    public assignPageData(data) {
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
        if (data['zoom'] && data['zoom']['url']) {
            this.imageType = PageImageType.TILES;
        } else if (data['pdf'] && data['pdf']['url']) {
            this.imageType = PageImageType.PDF;
            this.pdf = data['pdf']['url'];
        } else {
            this.imageType = PageImageType.JPEG;
        }
    }

    public viewable() {
        return this.imageType === PageImageType.TILES || this.imageType === PageImageType.JPEG;
    }

    public clear() {
        this.pdf = null;
        this.loaded = false;
        this.imageType = PageImageType.None;
    }
}


export enum PagePosition {
    Single, None, Left, Right
}

export enum PageImageType {
    TILES, PDF, JPEG, None
}

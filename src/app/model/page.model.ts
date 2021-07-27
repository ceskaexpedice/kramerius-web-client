export class Page {

    snippet: string;
    loaded = false;
    uuid: string;
    supplementUuid: string;
    type: string;
    number: string;
    index: number;
    thumb: string;
    display: number;
    selected = false;
    pdf: string;
    position = PagePosition.None;
    imageType = PageImageType.None;
    //providedByDnnt = false;
    providedByLabel: string;
    //dnntFlag = false;
    licences = [];
    licence: string;
    originUrl: string;
    public: boolean;
    title: string;

    constructor() {
    }

    setTitle(title: string) {
        if (!title) {
            title = "";
        }
        title = String(title).trim();
        if (this.number.trim() != title) {
            this.title = title;
        }
    }

    showPageType(): boolean {
        return !!this.type && this.type != 'normalpage' && this.type != 'unknown';
    }

    public assignPageData(data) {
        if (!data) {
            return;
        }
        this.loaded = true;
        this.licences = data['licences'] || [];
        this.licence = data['licence'];
        if (data['replicatedFrom'] && data['replicatedFrom'].length > 0) {
            this.originUrl = data['replicatedFrom'][0];
        }
        if (data['imageType'] == 'tiles') {
            this.imageType = PageImageType.TILES;
        } else if (data['imageType'] == 'image/jpeg') {
            this.imageType = PageImageType.JPEG;
        } else if (data['imageType'] == 'pdf') {
            this.imageType = PageImageType.PDF;
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

export class Page {

    snippet: string;
    loaded = false;
    uuid: string;
    parentDoctype: string;
    parentUuid: string;
    type: string;
    number: string;
    index: number;
    thumb: string;
    display: number;
    selected = false;
    position = PagePosition.None;
    imageType = PageImageType.None;
    licences = [];
    licence: string;
    originUrl: string;
    public: boolean;
    title: string;
    placement: string;

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
        this.loaded = false;
        this.imageType = PageImageType.None;
    }

    public clone(): Page {
        const clone = new Page();
        clone.snippet = this.snippet;
        clone.loaded = this.loaded;
        clone.uuid = this.uuid;
        clone.parentDoctype = this.parentDoctype;
        clone.parentUuid = this.parentUuid;
        clone.type = this.type;
        clone.number = this.number;
        clone.index = this.index;
        clone.thumb = this.thumb;
        clone.display = this.display;
        clone.selected = this.selected;
        clone.position = this.position;
        clone.imageType = this.imageType;
        clone.licences = this.licences;
        clone.licence = this.licence;
        clone.originUrl = this.originUrl;
        clone.public = this.public;
        clone.title = this.title;
        clone.placement = this.placement;
        return clone;
    }
}


export enum PagePosition {
    Single, None, Left, Right
}

export enum PageImageType {
    TILES, PDF, JPEG, None
}

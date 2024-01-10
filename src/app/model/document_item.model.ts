export class DocumentItem {
    title: string;
    titleEn: string;
    localTitles: any;
    authors: string[];
    geonames: string[];
    date: string;
    doctype: string;
    category: string;
    uuid: string;
    root_uuid: string;
    root_title: string;
    public: boolean;
    url: string;
    description: string;
    descriptionEn: string;
    localDescriptions: any;
    volumeNumber: string;
    volumeYear: string;
    pdf = false;
    epub = false;
    hits: number;
    context: Context[] = [];
    library: string;
    donators: string[];
    params;
    north: number;
    south: number;
    west: number;
    east: number;
    licences: string[] = [];
    sources: string[] = [];
    originUrl: string;
    index: number;

    selected: boolean = false;
    licence: string;
    in_collection: string[];
    in_collections: string[];

    createdAt: string;

    resolveUrl(prefix: string) {
        if (this.doctype === 'periodical' || this.doctype === 'periodicalvolume' || this.doctype === 'convolute') {
            this.url = prefix + '/periodical/' + this.uuid;
        } else if (this.doctype === 'soundrecording') {
            this.url = prefix + '/music/' + this.uuid;
        } else if (this.doctype === 'collection') {
            this.url = prefix + '/collection/' + this.uuid;
        } else if (this.doctype === 'page') {
            this.url = prefix + '/uuid/' + this.uuid;
        } else {
            this.url = prefix + '/view/' + this.uuid;
        }
        // if (this.query) {
        //     this.url += '?q=' + this.query;
        // }
    }

    public getUuidFromContext(doctype: string): string|null {
        for (const context of this.context) {
            if (context.doctype === doctype) {
                return context.uuid;
            }
        }
    }

    public getParentUuid(): string|null {
        if (this.context && this.context.length > 1) {
            return this.context[this.context.length - 2].uuid;
        }
    }

    public getParentDoctype(): string  {
        if (this.context && this.context.length > 1) {
            return this.context[this.context.length - 2].doctype;
        }
    }

    public isPoint(): boolean {
        return this.south === this.north && this.east === this.west;
    }

    public getTitle(lang: string): string {
        if (this.localTitles && this.localTitles[lang]) {
            return this.localTitles[lang];
        }
        return this.title;
    }

    public getDescription(lang: string): string {
        if (this.localDescriptions) {
            if (this.localDescriptions[lang]) {
                return this.localDescriptions[lang];
            } else {
                return this.localDescriptions['cs'];
            }
        } else {
            if (lang == 'en' && this.descriptionEn) {
                return this.descriptionEn;
            }
            return this.description;
        }
    }
}

export class Context {

    constructor(public uuid: string, public doctype: string) {

    }
}

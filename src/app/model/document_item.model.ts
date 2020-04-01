export class DocumentItem {
    title: string;
    authors: string[];
    geonames: string[];
    date: string;
    doctype: string;
    uuid: string;
    root_uuid: string;
    public: boolean;
    url: string;
    volumeNumber: string;
    volumeYear: string;
    pdf = false;
    hits: number;
    context: Context[] = [];
    library: string;
    donator: string;
    params;
    north: number;
    south: number;
    west: number;
    east: number;
    dnnt = false;
    originUrl: string;
    


    resolveUrl(prefix: string) {
        if (this.doctype === 'periodical' || this.doctype === 'periodicalvolume') {
            this.url = prefix + '/periodical/' + this.uuid;
        } else if (this.doctype === 'soundrecording') {
            this.url = prefix + '/music/' + this.uuid;
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

    public isPoint(): boolean {
        return this.south === this.north && this.east === this.west;
    }

}

export class Context {

    constructor(public uuid: string, public doctype: string) {

    }
}

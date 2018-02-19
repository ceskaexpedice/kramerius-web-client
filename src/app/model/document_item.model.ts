export class DocumentItem {
    title: string;
    authors: string[];
    date: string;
    doctype: string;
    uuid: string;
    root_uuid: string;
    public: boolean;
    url: string;
    volumeNumber: string;
    volumeYear: string;
    pdf = false;
    childrenAccessibility: string;
    query: string;
    hits: number;
    context: Context[] = [];

    constructor() {
    }

    resolveUrl() {
        if (this.doctype === 'periodical') {
            this.url =  '/periodical/' + this.uuid;
        } else if (this.doctype === 'soundrecording') {
            this.url = '/music/' + this.uuid;
        } else {
            this.url = '/view/' + this.uuid;
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

}

export class Context {

    constructor(public uuid: string, public doctype: string) {

    }
}

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
    hits: number;
    context: Context[] = [];
    library: string;
    params;

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

}

export class Context {

    constructor(public uuid: string, public doctype: string) {

    }
}

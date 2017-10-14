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

    constructor() {
    }

    resolveUrl() {
        if (this.doctype === 'periodical') {
            this.url =  '/periodical/' + this.uuid;
        } else {
            this.url = '/view/' + this.uuid;
        }
    }

}

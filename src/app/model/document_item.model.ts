export class DocumentItem {
    title: string;
    authors: string[];
    date: string;
    doctype: string;
    uuid: string;
    public: boolean;

    constructor() {
    }

    getUrl(): string {
        if (this.doctype === 'periodical') {
            return '/periodical/' + this.uuid;
        } else {
            return '/view/' + this.uuid;
        }
    }

}

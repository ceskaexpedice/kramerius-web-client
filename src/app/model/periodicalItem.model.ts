export class PeriodicalItem {
    title: string;
    subtitle: string;
    doctype: string;
    public: boolean;
    uuid: string;
    thumb: string;

    constructor() {
    }

    getUrl(): string {
        if (this.doctype === 'periodicalvolume') {
            return '/periodical/' + this.uuid;
        } else {
            return '/view/' + this.uuid;
        }
    }

}

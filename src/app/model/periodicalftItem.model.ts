
export class PeriodicalFtItem {
    volume: string;
    authors: string[];
    issue: string;
    page: string;
    date: string;
    year: string;
    part: string;
    title: string;
    context;
    uuid: string;
    public: boolean;
    thumb: string;
    text: string;
    query: string;
    type: string; // 'page', 'monograph_unit_page', 'monograph_unit', 'article'

    constructor() {
        this.context = {};
    }

    getPath(): string {
        console.log('context', this.context);
        if (this.type === 'page' || this.type === 'monograph_unit_page') {
            const uuid = this.context['article'] || this.context['monographunit'] || this.context['periodicalitem'] || this.context['periodicalvolume'];
            return 'view/' + uuid;
        } else {
            return 'view/' + this.uuid;
        }
    }

    getQuery() {
        if (this.type === 'page' || this.type === 'monograph_unit_page') {
            return { page: this.uuid, fulltext: this.query };
        } else {
            return {};
        }
    }

}

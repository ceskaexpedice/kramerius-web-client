
export class PeriodicalFtItem {
    volume: string;
    authors: string[];
    issue: string;
    supplement: string;
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
    model: string;
    type: string; // 'page', 'monograph_unit_page', 'monograph_unit', 'article'
    parent: string;
    licences: string[] = [];

    constructor() {
        this.context = {};
    }

    getPath(): string {
        if (this.type === 'page' || this.type === 'monograph_unit_page') {
            const uuid = this.context['article'] || this.context['monographunit'] || this.context['periodicalitem']  || this.context['supplement'] || this.context['periodicalvolume'];
            return 'view/' + uuid;
        } else if (this.type === 'omnibus_unit_page') {
            const uuid = this.context['convolute'];
            return 'view/' + uuid; 
        } else if (this.type === 'article') {
            const uuid = this.context['periodicalitem'] || this.context['periodicalvolume'];
            return 'view/' + uuid;
        } else {
            return  'view/' + this.uuid;
        }
    }

    getQuery() {
        if (this.type === 'page' || this.type === 'monograph_unit_page' || this.type === 'omnibus_unit_page') {
            return { page: this.uuid, fulltext: this.query };
        } else if (this.type === 'article') {
            return { article: this.uuid };
        } else {
            return {};
        }
    }

}

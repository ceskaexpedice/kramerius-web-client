
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
    path: string;
    queryParams: any;

    constructor() {
        this.context = {};
    }

    getPath(): string {
        if (this.path) {
            return this.path;
        }
        if (this.type === 'page' || this.type === 'monograph_unit_page') {
            const uuid = this.context['article'] || this.context['monographunit'] || this.context['periodicalitem'] || this.context['periodicalvolume'];
            this.path = 'view/' + uuid;
        } else if (this.type === 'article') {
            const uuid = this.context['periodicalitem'] || this.context['periodicalvolume'];
            this.path = 'view/' + uuid;
        } else {
            this.path = 'view/' + this.uuid;
        }
        return this.path;
    }

    getQuery() {
        if (this.queryParams) {
            return this.queryParams;
        }
        if (this.type === 'page' || this.type === 'monograph_unit_page') {
            this.queryParams = { page: this.uuid, fulltext: this.query };
        } else if (this.type === 'article') {
            this.queryParams = { article: this.uuid };
        } else {
            this.queryParams = {};
        }
        return this.queryParams;
    }

}

export class PeriodicalQuery {

    static THIS_YEAR = (new Date()).getFullYear();

    uuid: string;
    accessibility: string;
    source: string;
    fulltext: string;
    page: number;
    from: number;
    to: number;
    ordering: string; // relevance | earliest | latest
    folder: any;
    folderItems: string[] = [];  

    constructor() {
    }

    public static fromParams(uuid: string, params): PeriodicalQuery {
        const query = new PeriodicalQuery();
        console.log('fromParams', params);
        query.uuid = uuid;
        query.setAccessibility(params.get('accessibility'));
        query.setSource(params.get('source'));
        query.setFulltext(params.get('fulltext'));
        query.setYearRange(params.get('from'), params.get('to'));
        query.setOrdering(params.get('sort'));
        query.setPage(params.get('page'));
        query.folder = params.get('folder');
        return query;
    }

    public setYearRange(from: number, to: number) {
        this.page = 1;
        if ((from || from === 0) && to) {
            this.from = from;
            this.to = to;
        } else {
            this.clearYearRange();
        }
    }

    public isYearRangeSet(): boolean {
        return (this.from && this.from > 0) || (this.to && this.to !== PeriodicalQuery.THIS_YEAR);
    }

    private clearYearRange() {
        this.from = 0;
        this.to = (new Date()).getFullYear();
    }

    public setAccessibility(accessibility: string) {
        this.page = 1;
        if (accessibility === 'private') {
            this.accessibility = 'private';
        } else if (accessibility === 'public') {
            this.accessibility = 'public';
        } else {
            this.accessibility = 'all';
        }
    }

    public setSource(source: string) {
        this.page = 1;
        this.source = source;
    }

    public setOrdering(ordering: string) {
        this.page = 1;
        if (ordering === 'latest') {
            this.ordering = 'latest';
        } else if (ordering === 'earliest') {
            this.ordering = 'earliest';
        } else {
            this.ordering = 'relevance';
        }
    }

    public setFulltext(fulltext: string) {
        this.page = 1;
        this.fulltext = fulltext;
    }

    public setPage(page) {
        let p = parseInt(page, 10);
        if (!p) {
            p = 1;
        }
        this.page = p;
    }

    toUrlParams(preservePage: boolean = false) {
        const params = {};
        if (this.fulltext) {
            params['fulltext'] = this.fulltext;
        }
        if (preservePage && this.fulltext && this.page && this.page > 1) {
            params['page'] = this.page;
        }
        if (this.isYearRangeSet()) {
            params['from'] = this.from;
            params['to'] = this.to;
        }
        if (this.accessibility === 'public' || this.accessibility === 'private') {
            params['accessibility'] = this.accessibility;
        }
        if (this.source) {
            params['source'] = this.source;
        }
        if (this.ordering === 'latest' || this.ordering === 'earliest') {
            params['sort'] = this.ordering;
        }
        if (this.folder) {
            params['folder'] = this.folder;
        }
        return params;
    }

}

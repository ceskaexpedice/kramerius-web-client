export class SearchQuery {
    accessibility: string;
    query: string;
    page: number;

    constructor() {
    }

    public static fromParams(params): SearchQuery {
        const query = new SearchQuery();
        query.query = params['q'];
        query.setPage(params['page']);
        query.setAccessibility(params['accessibility']);
        return query;
    }

    setAccessibility(accessibility: string) {
        if (accessibility === 'private') {
            this.accessibility = 'private';
        } else if (accessibility === 'public') {
            this.accessibility = 'private';
        } else {
            this.accessibility = 'all';
        }
    }

    setPage(page: string) {
        let p = parseInt(page, 10);
        if (!p) {
            p = 1;
        }
        this.page = p;
    }

    getRows(): number {
        return 60;
    }

    getStart(): number {
        return 60 * (this.page - 1);
    }

}

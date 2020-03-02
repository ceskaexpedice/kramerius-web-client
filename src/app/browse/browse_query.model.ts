export class BrowseQuery {
    accessibility: string;
    ordering: string;
    category: string;
    page: number;
    text: string;


    constructor() {
    }

    public static fromParams(params, defaultCategory): BrowseQuery {
        const query = new BrowseQuery();
        query.setOrdering(params['sort']);
        query.setPage(params['page']);
        query.setCategory(params['category'] || defaultCategory);
        query.setAccessibility(params['accessibility']);
        query.setText(params['bq']);
        return query;
    }

    public setAccessibility(accessibility: string) {
        if (accessibility === 'private') {
            this.accessibility = 'private';
        } else if (accessibility === 'public') {
            this.accessibility = 'public';
        } else {
            this.accessibility = 'all';
        }
    }

    public setOrdering(ordering: string) {
        if (ordering === 'alphabetical') {
            this.ordering = 'alphabetical';
        } else {
            this.ordering = 'occurrence';
        }
    }

    public setText(text: string) {
        this.text = text;
    }

    public setPage(page) {
        let p = parseInt(page, 10);
        if (!p) {
            p = 1;
        }
        this.page = p;
    }

    public setCategory(category: string) {
        if (category) {
            this.category = category;
        }
    }

    getRows(): number {
        if (this.category === 'languages') {
            return 1000;
        } else {
            return 100;
        }
    }

    getStart(): number {
        return this.getRows() * (this.page - 1);
    }

    getText(): string {
        return this.text;
    }

    toUrlParams() {
        const params = {};
        if (this.page && this.page > 1) {
            params['page'] = this.page;
        }
        if (this.accessibility === 'public' || this.accessibility === 'private') {
            params['accessibility'] = this.accessibility;
        }
        if (this.ordering) {
            params['sort'] = this.ordering;
        }
        if (this.category) {
            params['category'] = this.category;
        }
        if (this.text) {
            params['bq'] = this.text;
        }
        return params;
    }






}

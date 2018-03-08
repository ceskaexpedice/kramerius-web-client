import { query } from '@angular/core/src/animation/dsl';
export class PeriodicalQuery {
    uuid: string;
    accessibility: string;
    fulltext: string;
    page: number;

    constructor() {
    }

    public static fromParams(uuid: string, params): PeriodicalQuery {
        const query = new PeriodicalQuery();
        query.uuid = uuid;
        query.setAccessibility(params.get('accessibility'));
        query.setFulltext(params.get('fulltext'));
        query.setPage(params.get('page'));
        return query;
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
        if (this.accessibility === 'public' || this.accessibility === 'private') {
            params['accessibility'] = this.accessibility;
        }
        return params;
    }



}

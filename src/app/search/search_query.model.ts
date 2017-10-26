export class SearchQuery {
    accessibility: string;
    query: string;
    page: number;
    sort: string;

    constructor() {
    }

    public static fromParams(params): SearchQuery {
        const query = new SearchQuery();
        query.query = params['q'];
        query.setSort(params['sort']);
        query.setPage(params['page']);
        query.setAccessibility(params['accessibility']);
        return query;
    }

    private setAccessibility(accessibility: string) {
        if (accessibility === 'private') {
            this.accessibility = 'private';
        } else if (accessibility === 'public') {
            this.accessibility = 'public';
        } else {
            this.accessibility = 'all';
        }
    }

    public setSort(sort: string) {
        if (sort) {
            this.sort = sort;
        } else if (this.query) {
            this.sort = 'relevance';
        } else {
            this.sort = 'newest';
        }
    }

    private setPage(page: string) {
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

    getQ(): string {
        if (!this.query || this.query === '*') {
            return null;
        }
        let q = this.query;
        q = q.replace(/"/g, '').replace(/-/g, '\\-');
        if (q.indexOf(':') > -1 || q.indexOf('[') > -1 || q.indexOf(']') > -1 || q.indexOf('!') > -1) {
            q = '"' + q + '"';
        }
        return q;
    }



    buildQuery(): string {
        const qString = this.getQ();
        let q = 'q=';
        let rel = false;
        if (qString) {
          if (this.sort === 'relevance') {
            q += '_query_:"{!dismax qf=\'dc.title^1000 text^0.0001\' v=$q1}\"';
            rel = true;
          } else {
            q += qString;
          }
        } else {
          q += '*:*';
        }
        if (this.accessibility === 'public') {
            q += ' AND dostupnost:public';
        } else if (this.accessibility === 'private') {
            q += ' AND dostupnost:private';
        }
        q += ' AND (fedora.model:monograph^5 OR fedora.model:periodical^5 OR fedora.model:soundrecording OR fedora.model:map OR fedora.model:graphic OR fedora.model:sheetmusic OR fedora.model:archive OR fedora.model:manuscript)';
        q += this.getDateSortRestriction();
        if (rel) {
            q += '&q1=' + qString;
        }
        q += this.getSortParam();
        return q;
    }



    toUrlParams() {
        const params = {};
        if (this.page && this.page > 1) {
            params['page'] = this.page;
        }
        if (this.accessibility === 'public' || this.accessibility === 'private') {
            params['accessibility'] = this.accessibility;
        }
        if (this.query) {
            params['q'] = this.query;
        }
        if (this.sort) {
            params['sort'] = this.sort;
        }
        return params;
    }


    private getDateSortRestriction() {
        if (this.sort === 'latest') {
            return ' AND datum_begin: [1 TO 3000]';
        } else if (this.sort === 'earliest') {
            return ' AND datum_end: [1 TO 3000]';
        }
        return '';
    }


    private getSortParam(): string {
        if (this.sort === 'newest') {
            return '&sort=created_date%20desc';
        } else if (this.sort === 'latest') {
           return '&sort=datum_end%20desc';
        } else if (this.sort === 'earliest') {
           return '&sort=datum_begin%20asc';
        } else if (this.sort === 'alphabetical') {
           return '&sort=title_sort%20asc';
        }
        return '';
    }
}

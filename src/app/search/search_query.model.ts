export class SearchQuery {
    accessibility: string;
    query: string;
    page: number;
    ordering: string;

    keywords: string[] = [];
    authors: string[] = [];
    languages: string[] = [];
    doctypes: string[] = [];
    collections: string[] = [];

    from = -1;
    to = -1;


    constructor() {
    }

    public static fromParams(params): SearchQuery {
        const query = new SearchQuery();
        query.query = params['q'];
        query.setOrdering(params['ordering']);
        query.setPage(params['page']);
        query.setFiled(query.keywords, params['keywords']);
        query.setFiled(query.doctypes, params['doctypes']);
        query.setFiled(query.authors, params['authors']);
        query.setFiled(query.languages, params['languages']);
        query.setFiled(query.collections, params['collections']);
        query.setAccessibility(params['accessibility']);
        query.setYearRange(params['from'], params['to']);
        return query;
    }

    public static getSolrField(field): string {
        if (field === 'keywords') {
            return 'keywords';
        } else if (field === 'authors') {
            return 'facet_autor';
        } else if (field === 'doctypes') {
            return 'fedora.model';
        } else if (field === 'categories') {
            return 'document_type';
        } else if (field === 'languages') {
            return 'language';
        } else if (field === 'collections') {
            return 'collection';
        } else if (field === 'accessibility') {
            return 'dostupnost';
        }
        return '';
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

    public setYearRange(from: number, to: number) {
        if (from && to) {
            this.from = from;
            this.to = to;
        } else {
            this.clearYearRange();
        }
    }


    private clearYearRange() {
        this.from = 0;
        this.to = (new Date()).getFullYear();
    }

    private setFiled(fieldValues: string[], input: string) {
        if (input) {
            input.split(',,').forEach(function(a) {
                fieldValues.push(a);
            });
        }
    }

    public setOrdering(ordering: string) {
        if (ordering) {
            if (ordering === 'relevance' && !this.hasQueryString()) {
                this.ordering = 'newest';
            } else {
                this.ordering = ordering;
            }
        } else if (this.query) {
            this.ordering = 'relevance';
        } else {
            this.ordering = 'newest';
        }
    }

    public setPage(page) {
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


    isYearRangeSet(): boolean {
        return (this.from && this.from > 0) || (this.to && this.to !== (new Date()).getFullYear());
    }


    buildQuery(skip: string): string {
        const qString = this.getQ();
        let q = 'q=';
        let rel = false;
        if (qString) {
          if (this.ordering === 'relevance' && !skip) {
            q += '_query_:"{!dismax qf=\'dc.title^1000 text^0.0001\' v=$q1}\"';
            rel = true;
          } else {
            q += '_query_:"{!dismax qf=\'dc.title text\' v=$q1}\"';
            rel = true;
          }
        } else {
          q += '*:*';
        }
        if (skip !== 'accessibility') {
            if (this.accessibility === 'public') {
                q += ' AND dostupnost:public';
            } else if (this.accessibility === 'private') {
                q += ' AND dostupnost:private';
            } else if (!skip) {
                q += ' AND (dostupnost:public^5000 OR dostupnost:private)';
            }
        }
        if (this.isYearRangeSet()) {
            q += ' AND (rok:[' + this.from + ' TO ' + this.to + '] OR (datum_begin:[* TO ' + this.to + '] AND datum_end:[' + this.from + ' TO *]))';
        }
        q += this.addToQuery('keywords', this.keywords, skip);
        q += this.addToQuery('doctypes', this.doctypes, skip);
        q += this.addToQuery('authors', this.authors, skip);
        q += this.addToQuery('languages', this.languages, skip);
        q += this.addToQuery('collections', this.collections, skip);
        // q += ' AND (fedora.model:monograph^5 OR fedora.model:periodical^5 OR fedora.model:soundrecording OR fedora.model:map OR fedora.model:graphic OR fedora.model:sheetmusic OR fedora.model:archive OR fedora.model:manuscript)';
        q += this.getDateOrderingRestriction();
        if (rel) {
            q += '&q1=' + qString;
        }
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
        if (this.ordering) {
            params['ordering'] = this.ordering;
        }
        if (this.keywords.length > 0) {
            params['keywords'] = this.keywords.join(',,');
        }
        if (this.authors.length > 0) {
            params['authors'] = this.authors.join(',,');
        }
        if (this.languages.length > 0) {
            params['languages'] = this.languages.join(',,');
        }
        if (this.doctypes.length > 0) {
            params['doctypes'] = this.doctypes.join(',,');
        }
        if (this.collections.length > 0) {
            params['collectiions'] = this.collections.join(',,');
        }
        if (this.isYearRangeSet()) {
            params['from'] = this.from;
            params['to'] = this.to;
        }
        return params;
    }


    private getDateOrderingRestriction() {
        if (this.ordering === 'latest') {
            return ' AND datum_begin: [1 TO 3000]';
        } else if (this.ordering === 'earliest') {
            return ' AND datum_end: [1 TO 3000]';
        }
        return '';
    }


    public getOrderingValue(): string {
        if (this.ordering === 'newest') {
            return 'created_date desc';
        } else if (this.ordering === 'latest') {
           return 'datum_end desc';
        } else if (this.ordering === 'earliest') {
           return 'datum_begin asc';
        } else if (this.ordering === 'alphabetical') {
           return 'title_sort asc';
        }
        return null;
    }


    private addToQuery(field, values, skip) {
        let q = '';
        if (skip !== field) {
            if (values.length > 0) {
                q = ' AND (' + SearchQuery.getSolrField(field) + ':"' + values.join('" OR ' + SearchQuery.getSolrField(field) + ':"') + '")';
            }
        }
        return q;
    }

    public removeAllFilters() {
        this.accessibility = 'all';
        this.query = null;
        this.page = 1;
        this.keywords = [];
        this.doctypes = [];
        this.authors = [];
        this.collections = [];
        this.languages = [];
        this.clearYearRange();
    }

    public hasQueryString() {
        if (this.query) {
            return true;
        }
        return false;
    }

    public anyFilter() {
        if (this.hasQueryString()) {
            return true;
        }
        if (this.accessibility && this.accessibility !== 'all') {
            return true;
        }
        if (this.keywords && this.keywords.length > 0) {
            return true;
        }
        if (this.doctypes && this.doctypes.length > 0) {
            return true;
        }
        if (this.authors && this.authors.length > 0) {
            return true;
        }
        if (this.languages && this.languages.length > 0) {
            return true;
        }
        if (this.collections && this.collections.length > 0) {
            return true;
        }
        if (this.isYearRangeSet()) {
            return true;
        }
        return false;
    }



}

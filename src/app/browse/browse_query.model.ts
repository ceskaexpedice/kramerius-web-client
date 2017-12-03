export class BrowseQuery {
    accessibility: string;
    ordering: string;
    category: string;
    page: number;

    constructor() {
    }

    public static fromParams(params): BrowseQuery {
        const query = new BrowseQuery();
        query.setOrdering(params['sort']);
        query.setPage(params['page']);
        query.setCategory(params['category']);
        query.setAccessibility(params['accessibility']);
        return query;
    }

    public getSolrField(): string {
        if (this.category === 'keywords') {
            return 'keywords';
        } else if (this.category === 'authors') {
            return 'facet_autor';
        } else if (this.category === 'doctypes') {
            return 'fedora.model';
        } else if (this.category === 'categories') {
            return 'document_type';
        } else if (this.category === 'languages') {
            return 'language';
        } else if (this.category === 'collections') {
            return 'collection';
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

    public setOrdering(ordering: string) {
        if (ordering === 'alphabetical') {
            this.ordering = 'alphabetical';
        } else {
            this.ordering = 'occurrence';
        }
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
        } else {
            this.category = 'authors';
        }
    }

    getRows(): number {
        return 60;
    }

    getStart(): number {
        return 60 * (this.page - 1);
    }

    buildQuery(): string {
        let q = 'q=(fedora.model:monograph%20OR%20fedora.model:periodical%20OR%20fedora.model:soundrecording%20OR%20fedora.model:map%20OR%20fedora.model:graphic%20OR%20fedora.model:sheetmusic%20OR%20fedora.model:archive%20OR%20fedora.model:manuscript)';
        if (this.accessibility === 'public') {
            q += ' AND dostupnost:public';
        } else if (this.accessibility === 'private') {
            q += ' AND dostupnost:private';
        }
        q += '&facet=true&facet.field=' + this.getSolrField()
           + '&facet.mincount=1'
           + '&facet.sort=' + this.getOrderingValue()
           + '&facet.limit=' + this.getRows()
           + '&facet.offset=' + this.getStart()
           + '&rows=0'
           + '&json.facet={x:"unique(' + this.getSolrField() + ')"}';

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
        if (this.ordering) {
            params['sort'] = this.ordering;
        }
        if (this.category) {
            params['category'] = this.category;
        }
        return params;
    }


    public getOrderingValue(): string {
        if (this.ordering === 'alphabetical') {
            return 'index';
        } else {
            return 'count';
        }
    }





}

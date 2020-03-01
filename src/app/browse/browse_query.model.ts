import { AppSettings } from '../services/app-settings';

export class BrowseQuery {
    accessibility: string;
    ordering: string;
    category: string;
    page: number;
    text: string;

    settings: AppSettings;

    constructor(settings: AppSettings) {
        this.settings = settings;
    }

    public static fromParams(params, settings: AppSettings): BrowseQuery {
        const query = new BrowseQuery(settings);
        query.setOrdering(params['sort']);
        query.setPage(params['page']);
        query.setCategory(params['category']);
        query.setAccessibility(params['accessibility']);
        query.setText(params['bq']);
        return query;
    }

    // public getSolrField(): string {
    //     if (this.category === 'keywords') {
    //         return 'keywords';
    //     } else if (this.category === 'authors') {
    //         return 'facet_autor';
    //     } else if (this.category === 'doctypes') {
    //         return 'fedora.model';
    //     } else if (this.category === 'categories') {
    //         return 'document_type';
    //     } else if (this.category === 'languages') {
    //         return 'language';
    //     } else if (this.category === 'locations') {
    //         return 'mods.physicalLocation';
    //     } else if (this.category === 'geonames') {
    //         return 'geographic_names';
    //     } else if (this.category === 'collections') {
    //         return 'collection';
    //     }
    //     return '';
    // }

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
        } else {
            this.category = this.getDefaultCategory();
        }
    }

    private getDefaultCategory(): string {
        for (const cat of this.settings.filters) {
            if (cat !== 'accessibility') {
                return cat;
            }
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

    // buildQuery(): string {
    //     let q = 'q=(' + this.settings.topLevelFilter + ')';
    //     if (this.accessibility === 'public' && this.settings.filters.includes('accessibility')) {
    //         q += ' AND dostupnost:public';
    //     } else if (this.accessibility === 'private') {
    //         q += ' AND dostupnost:private';
    //     }
    //     if (this.text) {
    //         if (this.category === 'keywords') {
    //             q += ' AND keywords:*' + this.text.toLowerCase() + '*';
    //         } else if (this.category === 'authors') {
    //             q += ' AND dc.creator:*' + this.text.toLowerCase() + '*';
    //         }
    //     }
    //     q += '&facet=true&facet.field=' + this.getSolrField()
    //        + '&facet.mincount=1'
    //        + '&facet.sort=' + this.getOrderingValue()
    //        + '&facet.limit=' + this.getRows()
    //        + '&facet.offset=' + this.getStart()
    //        + '&rows=0';

    //     if (this.text) {
    //         if (this.category === 'keywords') {
    //             q += '&facet.contains=' + this.getText();
    //         } else if (this.category === 'authors') {
    //             const text = this.getText().substring(0, 1).toUpperCase() + this.getText().substring(1);
    //             q += '&facet.contains=' + text;
    //         }
    //     }
    //      q += '&json.facet={x:"unique(' + this.getSolrField() + ')"}';

    //     return q;
    // }

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

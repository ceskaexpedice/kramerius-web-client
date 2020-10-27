import { Utils } from '../services/utils.service';
import { AppSettings } from '../services/app-settings';

export class SearchQuery {

    private static YEAR_FROM = 0;
    private static YEAR_TO = (new Date()).getFullYear();

    accessibility: string;
    query: string;
    page: number;
    ordering: string;

    keywords: string[] = [];
    authors: string[] = [];
    languages: string[] = [];
    locations: string[] = [];
    geonames: string[] = [];
    doctypes: string[] = [];
    collections: string[] = [];
    publishers: string[] = [];
    places: string[] = [];
    genres: string[] = [];

    field: string;
    value: string;

    dsq: string;

    from = -1;
    to = -1;

    north: number = null;
    south: number = null;
    east: number = null;
    west: number = null;

    settings: AppSettings;

    collection: string;

    constructor(settings: AppSettings) {
        this.settings = settings;
    }

    public static fromParams(params, context, settings: AppSettings): SearchQuery {
        const query = new SearchQuery(settings);
        query.query = params['q'];
        query.dsq = params['dsq'];
        query.setPage(params['page']);
        query.setFiled(query.keywords, 'keywords', params);
        query.setFiled(query.doctypes, 'doctypes', params);
        query.setFiled(query.authors, 'authors', params);
        query.setFiled(query.languages, 'languages', params);
        query.setFiled(query.locations, 'locations', params);
        query.setFiled(query.geonames, 'geonames', params);
        query.setFiled(query.collections, 'collections', params);
        query.setFiled(query.publishers, 'publishers', params);
        query.setFiled(query.places, 'places', params);
        query.setFiled(query.genres, 'genres', params);

        if (!query.query) {
            query.setCustomField(params);
        }
        query.setOrdering(params['sort']);
        if (settings.filters.indexOf('accessibility') > -1) {
            query.setAccessibility(params['accessibility']);
        }
        query.setYearRange(parseInt(params['from'], 10), parseInt(params['to'], 10));
        if (params['north']) {
            query.setBoundingBox(parseFloat(params['north']), parseFloat(params['south']), parseFloat(params['west']), parseFloat(params['east']));
        }
        if (context.key === 'collection') {
            query.collection = context.value;
        }
        return query;
    }

    public setAccessibility(accessibility: string) {
        if (accessibility === 'private') {
            this.accessibility = 'private';
        } else if (accessibility === 'public') {
            this.accessibility = 'public';
        } else if (accessibility === 'dnnt') {
            this.accessibility = 'dnnt';
        } else if (accessibility === 'accessible') {
            this.accessibility = 'accessible';
        } else {
            this.accessibility = 'all';
        }
    }

    public setYearRange(from: number, to: number) {
        if ((from || from === 0) && (to || to === 0)) {
            this.from = from;
            this.to = to;
        } else {
            this.clearYearRange();
        }
    }


    private clearYearRange() {
        this.from = SearchQuery.YEAR_FROM;
        this.to = SearchQuery.YEAR_TO;
    }

    public clearBoundingBox() {
        this.north = null;
        this.south = null;
        this.east = null;
        this.west = null;
    }

    public setBoundingBox(north: number, south: number, west: number, east: number) {
        this.north = north;
        this.south = south;
        this.west = west;
        this.east = east;
    }

    public isBoundingBoxSet(): boolean {
        return this.north != null;
    }

    private setCustomField(params) {
        if (params['field'] && params['value']) {
            this.field = params['field'];
            this.value = params['value'];
        }
    }

    private setFiled(fieldValues: string[], field: string, params) {
        const input = params[field];
        if (input && this.settings.filters.indexOf(field) > -1) {
            input.split(',,').forEach(function(a) {
                fieldValues.push(a);
            });
        }
    }

    public relevanceOrderingEnabled(): boolean {
        return this.hasQueryString() || this.isCustomFieldSet();
    }

    public setOrdering(ordering: string) {
        if (ordering) {
            if (ordering === 'relevance' && !this.relevanceOrderingEnabled()) {
                this.ordering = 'newest';
            } else {
                this.ordering = ordering;
            }
        } else if (this.query || this.isCustomFieldSet()) {
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

    getRawQ() {
        if (!this.query || this.query === '*') {
            return null;
        }
        return  this.query;
    }

    getQ(): string {
        if (!this.query || this.query === '*') {
            return null;
        }
        let q = this.query;
        if (!Utils.inQuotes(q)) {
            q = q.trim();
            while (q.indexOf('  ') > 0) {
                q = q.replace(/  /g, ' ');
            }
        }
        return q;
    }


    isYearRangeSet(): boolean {
        return this.from !== SearchQuery.YEAR_FROM || this.to !== SearchQuery.YEAR_TO;
    }


    public getCustomField(): string {
        return this.field;
    }

    public getCustomValue(): string {
        return this.value;
    }

    public isCustomFieldSet(): boolean {
        return !!this.field && !!this.value;
    }

    public removeCustomField() {
        this.field = null;
        this.value = null;
    }

    
    getChangeLibraryUrlParams() {
        const params = {};
        if (['public', 'private', 'dnnt', 'accessible'].indexOf(this.accessibility) >= 0) {
            params['accessibility'] = this.accessibility;
        }
        if (this.query) {
            params['q'] = this.query;
        }
        if (this.ordering) {
            params['sort'] = this.ordering;
        }
        if (this.doctypes.length > 0) {
            params['doctypes'] = this.doctypes.join(',,');
        }
        if (this.isCustomFieldSet()) {
            params['field'] = this.field;
            params['value'] = this.value;
        }
        if (this.isYearRangeSet()) {
            params['from'] = this.from;
            params['to'] = this.to;
        }
        return params;
    }


    toUrlParams() {
        const params = {};
        if (this.page && this.page > 1) {
            params['page'] = this.page;
        }
        if (['public', 'private', 'dnnt', 'accessible'].indexOf(this.accessibility) >= 0) {
            params['accessibility'] = this.accessibility;
        }
        if (this.dsq) {
            params['dsq'] = this.dsq;
        }
        if (this.query) {
            params['q'] = this.query;
        }
        if (this.ordering) {
            params['sort'] = this.ordering;
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
        if (this.locations.length > 0) {
            params['locations'] = this.locations.join(',,');
        }
        if (this.geonames.length > 0) {
            params['geonames'] = this.geonames.join(',,');
        }
        if (this.publishers.length > 0) {
            params['publishers'] = this.publishers.join(',,');
        }
        if (this.places.length > 0) {
            params['places'] = this.places.join(',,');
        }
        if (this.genres.length > 0) {
            params['genres'] = this.genres.join(',,');
        }
        if (this.doctypes.length > 0) {
            params['doctypes'] = this.doctypes.join(',,');
        }
        if (this.collections.length > 0) {
            params['collections'] = this.collections.join(',,');
        }
        if (this.isCustomFieldSet()) {
            params['field'] = this.field;
            params['value'] = this.value;
        }
        if (this.isYearRangeSet()) {
            params['from'] = this.from;
            params['to'] = this.to;
        }
        if (this.isBoundingBoxSet()) {
            params['north'] = this.north;
            params['south'] = this.south;
            params['west'] = this.west;
            params['east'] = this.east;
        }
        return params;
    }


    // private getDateOrderingRestriction() {
    //     if (this.ordering === 'latest') {
    //         return 'datum_begin: [1 TO 3000]';
    //     } else if (this.ordering === 'earliest') {
    //         return 'datum_end: [1 TO 3000]';
    //     }
    // }


    // public getOrderingValue(): string {
    //     if (this.ordering === 'newest') {
    //         return 'created_date desc';
    //     } else if (this.ordering === 'latest') {
    //        return 'datum_end desc';
    //     } else if (this.ordering === 'earliest') {
    //        return 'datum_begin asc';
    //     } else if (this.ordering === 'alphabetical') {
    //         if (this.getRawQ()) {
    //             return 'root_title asc';
    //         } else {
    //             return 'title_sort asc';
    //         }
    //     }
    //     return null;
    // }


    // private buildFacetFilter(field, values, skip) {
    //     if (skip !== field) {
    //         if (values.length > 0) {
    //             if (this.settings.filters.indexOf(field) > -1) {
    //                 if (field === 'doctypes') {
    //                     if (this.hasQueryString()) {
    //                         return ('(model_path:' + values.join('* OR model_path:') + '*)')
    //                     } else {
    //                         return ('(model_path:' + values.join(' OR model_path:') + ')')
    //                                     .replace(/model_path:monograph/, 'model_path:monograph OR model_path:monographunit');
    //                     }
    //                 } else {
    //                     return '(' + SearchQuery.getSolrField(field) + ':"' + values.join('" OR ' + SearchQuery.getSolrField(field) + ':"') + '")';
    //                 }
    //             }
    //         }
    //     }
    // }

    public removeAllFilters() {
        this.accessibility = 'all';
        this.query = null;
        this.page = 1;
        this.keywords = [];
        this.doctypes = [];
        this.authors = [];
        this.collections = [];
        this.languages = [];
        this.locations = [];
        this.geonames = [];
        this.publishers = [];
        this.places = [];
        this.genres = [];
        this.removeCustomField();
        this.clearYearRange();
    }

    public hasQueryString() {
        if (this.query) {
            return true;
        }
        return false;
    }

    public anyFilter(forPlaceholder: boolean = false) {
        if (!forPlaceholder && this.hasQueryString()) {
            return true;
        }
        if (this.isCustomFieldSet()) {
            return true;
        }
        if (!forPlaceholder && this.accessibility && this.accessibility !== 'all') {
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
        if (this.locations && this.locations.length > 0) {
            return true;
        }
        if (this.geonames && this.geonames.length > 0) {
            return true;
        }
        if (this.publishers && this.publishers.length > 0) {
            return true;
        }
        if (this.places && this.places.length > 0) {
            return true;
        }
        if (this.genres && this.genres.length > 0) {
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

    public onlyPublicFilterChecked(): boolean {
        return !this.anyFilter(true) && this.accessibility === 'public';
    }

}



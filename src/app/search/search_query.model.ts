import { AppSettings } from '../services/app-settings';

export class SearchQuery {

    private static YEAR_FROM = 0;
    private static YEAR_TO = (new Date()).getFullYear();

    accessibility: string;
    access: string;
    query: string;
    page: number;
    ordering: string;

    keywords: string[] = [];
    authors: string[] = [];
    languages: string[] = [];
    sources: string[] = [];
    licences: string[] = [];
    locations: string[] = [];
    geonames: string[] = [];
    doctypes: string[] = [];
    categories: string[] = [];
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
        query.setFiled(query.categories, 'categories', params);
        query.setFiled(query.authors, 'authors', params);
        query.setFiled(query.languages, 'languages', params);
        query.setFiled(query.sources, 'sources', params);
        query.setFiled(query.licences, 'licences', params);
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
        if (settings.filters.indexOf('access') > -1) {
            query.setAccess(params['access']);
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

    public setAccess(access: string) {
        if (['open', 'login', 'terminal', 'accessible'].indexOf(access) >= 0) {
            this.access = access;
        } else {
            this.access = 'all';
        }
    }

    public setAccessibility(accessibility: string) {
        if (accessibility === 'private') {
            this.accessibility = 'private';
        } else if (accessibility === 'public') {
            this.accessibility = 'public';
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
        if (['public', 'private', 'accessible'].indexOf(this.accessibility) >= 0) {
            params['accessibility'] = this.accessibility;
        }
        if (['open', 'login', 'terminal', 'accessible'].indexOf(this.access) >= 0) {
            params['access'] = this.access;
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
        if (this.categories.length > 0) {
            params['categories'] = this.categories.join(',,');
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
        if (this.dsq) {
            params['dsq'] = this.dsq;
        }
        if (this.query) {
            params['q'] = this.query;
        }
        if (['public', 'private', 'accessible'].indexOf(this.accessibility) >= 0) {
            params['accessibility'] = this.accessibility;
        }
        if (['open', 'login', 'terminal', 'accessible'].indexOf(this.access) >= 0) {
            params['access'] = this.access;
        }
        if (this.keywords.length > 0) {
            params['keywords'] = this.urlArray(this.keywords);
        }
        if (this.authors.length > 0) {
            params['authors'] = this.urlArray(this.authors);
        }
        if (this.languages.length > 0) {
            params['languages'] = this.urlArray(this.languages);
        }
        if (this.sources.length > 0) {
            params['sources'] = this.urlArray(this.sources);
        }
        if (this.licences.length > 0) {
            params['licences'] = this.urlArray(this.licences);
        }
        if (this.locations.length > 0) {
            params['locations'] = this.urlArray(this.locations);
        }
        if (this.geonames.length > 0) {
            params['geonames'] = this.urlArray(this.geonames);
        }
        if (this.publishers.length > 0) {
            params['publishers'] = this.urlArray(this.publishers);
        }
        if (this.places.length > 0) {
            params['places'] = this.urlArray(this.places);
        }
        if (this.genres.length > 0) {
            params['genres'] = this.urlArray(this.genres);
        }
        if (this.doctypes.length > 0) {
            params['doctypes'] = this.urlArray(this.doctypes);
        }
        if (this.categories.length > 0) {
            params['categories'] = this.urlArray(this.categories);
        }
        if (this.collections.length > 0) {
            params['collections'] = this.urlArray(this.collections);
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
        if (this.ordering) {
            if ((this.query || this.isCustomFieldSet())) {
                if (this.ordering != 'relevance') {
                    params['sort'] = this.ordering;
                }
            } else {
                if (this.ordering != 'newest') {
                    params['sort'] = this.ordering;
                }
            }
        }
        if (this.page && this.page > 1) {
            params['page'] = this.page;
        }
        return params;
    }

    private urlArray(array: string[]): string {
        array.sort((a: string, b: string) => {
            return a.localeCompare(b);
        });
        return array.join(',,');
    }


    public removeAllFilters() {
        this.accessibility = 'all';
        this.access = 'all';
        this.query = null;
        this.page = 1;
        this.keywords = [];
        this.doctypes = [];
        this.categories = [];
        this.authors = [];
        this.collections = [];
        this.languages = [];
        this.sources = [];
        this.licences = [];
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
        if (!forPlaceholder && this.access && this.access !== 'all') {
            return true;
        }
        if (this.keywords && this.keywords.length > 0) {
            return true;
        }
        if (this.doctypes && this.doctypes.length > 0) {
            return true;
        }
        if (this.categories && this.categories.length > 0) {
            return true;
        }
        if (this.authors && this.authors.length > 0) {
            return true;
        }
        if (this.languages && this.languages.length > 0) {
            return true;
        }
        if (this.sources && this.sources.length > 0) {
            return true;
        }
        if (this.licences && this.licences.length > 0) {
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



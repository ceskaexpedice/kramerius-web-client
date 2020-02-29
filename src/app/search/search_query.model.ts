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

    constructor(settings: AppSettings) {
        this.settings = settings;
    }

    public static fromParams(params, settings: AppSettings): SearchQuery {
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
        return query;
    }

    // public static getSolrField(field): string {
    //     if (field === 'keywords') {
    //         return 'keywords';
    //     } else if (field === 'authors') {
    //         return 'facet_autor';
    //     } else if (field === 'doctypes') {
    //         return 'fedora.model';
    //     } else if (field === 'categories') {
    //         return 'document_type';
    //     } else if (field === 'languages') {
    //         return 'language';
    //     } else if (field === 'locations') {
    //         return 'mods.physicalLocation';
    //     } else if (field === 'geonames') {
    //         return 'geographic_names';
    //     } else if (field === 'collections') {
    //         return 'collection';
    //     } else if (field === 'accessibility') {
    //         return 'dostupnost';
    //     }
    //     return '';
    // }


    public static getSolrCustomField(field): string {
        if (field === 'author') {
            return 'dc.creator';
        } else if (field === 'title') {
            return 'dc.title';
        } else if (field === 'keyword') {
            return 'keywords';
        } else if (field === 'geoname') {
            return 'geographic_names';
        } else if (field === 'issn') {
            return 'issn';
        } else if (field === 'isbn') {
            return 'dc.identifier';
        } else if (field === 'ddt') {
            return 'ddt';
        } else if (field === 'mdt') {
            return 'mdt';
        } else if (field === 'all') {
            return 'text';
        }
        return '';
    }

    public setAccessibility(accessibility: string) {
        if (accessibility === 'private') {
            this.accessibility = 'private';
        } else if (accessibility === 'public') {
            this.accessibility = 'public';
        } else if (accessibility === 'dnnt') {
            this.accessibility = 'dnnt';
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
        if (params['field'] && params['value'] && SearchQuery.getSolrCustomField(params['field'])) {
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

    // buildFilterQuery(facet: string = null): string {
    //     let fqFilters = [];
    //     if (this.getQ() || this.isCustomFieldSet()) {
    //         fqFilters.push('(' + this.settings.topLevelFilter + ' OR fedora.model:page OR fedora.model:article)');
    //     } else {
    //         fqFilters.push('(' + this.settings.topLevelFilter + ')');
    //     }
    //     if (facet !== 'accessibility' && this.settings.filters.indexOf('accessibility') > -1) {
    //         if (this.accessibility === 'public') {
    //             fqFilters.push('dostupnost:public');
    //         } else if (this.accessibility === 'private') {
    //             fqFilters.push('dostupnost:private');
    //         } else if (this.settings.dnntFilter && this.accessibility === 'dnnt') {
    //             fqFilters.push('dnnt:true');
    //         }
    //     }
    //     if (this.isYearRangeSet()) {
    //         const from = this.from === 0 ? 1 : this.from;
    //         fqFilters.push('(rok:[' + from + ' TO ' + this.to + '] OR (datum_begin:[* TO ' + this.to + '] AND datum_end:[' + from + ' TO *]))');
    //     }
    //     fqFilters.push(this.buildFacetFilter('keywords', this.keywords, facet));
    //     fqFilters.push(this.buildFacetFilter('doctypes', this.doctypes, facet));
    //     fqFilters.push(this.buildFacetFilter('authors', this.authors, facet));
    //     fqFilters.push(this.buildFacetFilter('languages', this.languages, facet));
    //     fqFilters.push(this.buildFacetFilter('locations', this.locations, facet));
    //     fqFilters.push(this.buildFacetFilter('geonames', this.geonames, facet));
    //     fqFilters.push(this.buildFacetFilter('collections', this.collections, facet));
    //     if (!this.isBoundingBoxSet()) {
    //         fqFilters.push(this.getDateOrderingRestriction());
    //     }
    //     fqFilters = fqFilters.filter( (el) => {
    //         return el != null && el !== '';
    //     });
    //     return fqFilters.join(' AND ');
    // }

    // buildQuery(facet: string): string {
    //     let qString = this.getQ();
    //     let value = qString;
    //     let q = 'q=';
    //     if (this.dsq) {
    //         q += this .dsq + ' AND '
    //     }
    //     if (this.isBoundingBoxSet()) {
    //         q += `{!field f=range score=overlapRatio}Intersects(ENVELOPE(${this.west},${this.east},${this.north},${this.south}))&fq=`;
    //     }
    //     if (this.isCustomFieldSet()) {
    //         value = this.value;
    //         q +=  SearchQuery.getSolrCustomField(this.field) + ':' + this.value;
    //     } else if (qString) {
    //         q += '_query_:"{!edismax qf=\'dc.title^10 dc.creator^2 text^0.1 mods.shelfLocator\' bq=\'(level:0)^20\' bq=\'(dostupnost:public)^2\' bq=\'(fedora.model:page)^0.1\' v=$q1}\"';
    //     } else {
    //         q += '*:*';
    //     }
    //     const fq = this.buildFilterQuery(facet);
    //     if (fq) {
    //         q += '&fq=' + fq;
    //     }
    //     if (qString || this.isCustomFieldSet()) {
    //         q += '&q1=' + value + '&group=true&group.field=root_pid&group.ngroups=true&group.sort=score desc';
    //         q += '&group.truncate=true';
    //         q += '&fl=PID,dostupnost,model_path,dc.creator,root_title,root_pid,dc.title,datum_str,img_full_mime,score';
    //     } else {
    //         q += '&fl=PID,dostupnost,fedora.model,dc.creator,dc.title,datum_str,img_full_mime';
    //     }
    //     if (this.settings.dnntFilter) {
    //         q += ',dnnt';
    //     }
    //     if (this.isBoundingBoxSet()) {
    //         q += ',location,geographic_names';
    //     }
    //     q += '&facet=true&facet.mincount=1'
    //        + this.addFacetToQuery(facet, 'keywords', 'keywords', this.keywords.length === 0)
    //        + this.addFacetToQuery(facet, 'languages', 'language', this.languages.length === 0)
    //        + this.addFacetToQuery(facet, 'locations', 'mods.physicalLocation', this.locations.length === 0)
    //        + this.addFacetToQuery(facet, 'geonames', 'geographic_names', this.geonames.length === 0)
    //        + this.addFacetToQuery(facet, 'authors', 'facet_autor', this.authors.length === 0)
    //        + this.addFacetToQuery(facet, 'collections', 'collection', this.collections.length === 0)
    //        + this.addFacetToQuery(facet, 'doctypes', 'model_path', this.doctypes.length === 0)
    //        + this.addFacetToQuery(facet, 'accessibility', 'dostupnost', this.accessibility === 'all');
    //     if (this.settings.dnntFilter) {
    //         q += '&facet.field=dnnt';
    //     }
    //     if (facet) {
    //         q += '&rows=0';
    //     } else if (this.isBoundingBoxSet()) {
    //         q += '&rows=' + '100' + '&start=' + '0';
    //     } else {
    //         const ordering = this.getOrderingValue();
    //         if (ordering) {
    //             q += '&sort=' + ordering;
    //         }
    //         q += '&rows=' + this.getRows() + '&start=' + this.getStart();
    //     }
    //     return q;
    // }

    // private addFacetToQuery(facet: string, currentFacet: string, field: string, apply: boolean): string {
    //     if (this.settings.filters.indexOf(currentFacet) > -1) {
    //         if ((!facet && apply) || currentFacet === facet) {
    //             return '&facet.field=' + field;
    //         }
    //     }
    //     return '';
    // }

    toUrlParams() {
        const params = {};
        if (this.page && this.page > 1) {
            params['page'] = this.page;
        }
        if (this.accessibility === 'public' || this.accessibility === 'private' || this.accessibility === 'dnnt') {
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



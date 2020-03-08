import { AppSettings } from './app-settings';
import { SearchQuery } from './../search/search_query.model';
import { PeriodicalFtItem } from './../model/periodicalftItem.model';
import { DocumentItem } from './../model/document_item.model';
import { PeriodicalItem } from './../model/periodicalItem.model';
import { Injectable } from '@angular/core';
import { BrowseQuery } from '../browse/browse_query.model';
import { PeriodicalQuery } from '../periodical/periodical_query.model';
import { Utils } from './utils.service';


@Injectable()
export class SolrService {

    private static fields = {
        'model': {
            '1.0': 'fedora.model',
            '2.0': 'n.model'
        },
        'id': {
            '1.0': 'PID',
            '2.0': 'n.pid'
        },
        'accessibility': {
            '1.0': 'dostupnost',
            '2.0': 'n.accessibility'
        },
        'authors': {
            '1.0': 'dc.creator',
            '2.0': 'n.authors'
        },
        'authors_search': {
            '1.0': 'dc.creator',
            '2.0': 'n.authors.search'
        },
        'authors_facet': {
            '1.0': 'facet_autor',
            '2.0': 'n.authors.facet'
        },
        'keywords_search': {
            '1.0': 'keywords',
            '2.0': 'n.keywords.search'
        },
        'keywords_facet': {
            '1.0': 'keywords',
            '2.0': 'n.keywords.facet'
        },
        'languages_search': {
            '1.0': 'language',
            '2.0': 'n.languages.facet'
        },
        'languages_facet': {
            '1.0': 'language',
            '2.0': 'n.languages.facet'
        },
        'locations_search': {
            '1.0': 'mods.physicalLocation',
            '2.0': 'n.physical_locations.facet'
        },
        'locations_facet': {
            '1.0': 'mods.physicalLocation',
            '2.0': 'n.physical_locations.facet'
        },
        'geonames_search': {
            '1.0': 'geographic_names',
            '2.0': 'n.geographic_names.search'
        },
        'geonames_facet': {
            '1.0': 'geographic_names',
            '2.0': 'n.geographic_names.facet'
        },
        'publishers_search': {
            '1.0': '',
            '2.0': 'n.publishers.search'
        },
        'publishers_facet': {
            '1.0': '',
            '2.0': 'n.publishers.facet'
        },
        'genres_search': {
            '1.0': '',
            '2.0': 'n.genres.search'
        },
        'genres_facet': {
            '1.0': '',
            '2.0': 'n.genres.facet'
        },
        'title': {
            '1.0': 'dc.title',
            '2.0': 'n.title.search'
        },
        'titles_search': {
            '1.0': 'dc.title',
            '2.0': 'n.titles.search'
        },
        'title_sort': {
            '1.0': 'title_sort',
            '2.0': 'n.title.sort'
        },
        'date': {
            '1.0': 'datum_str',
            '2.0': 'n.date.str'
        },
        'created_at': {
            '1.0': 'created_date',
            '2.0': 'n.created'
        },
        'dnnt': {
            '1.0': 'dnnt',
            '2.0': 'dnnt'
        },
        "coords_location": {
            '1.0': 'location',
            '2.0': ''
        },
        "coords_corner_ne": {
            '1.0': '',
            '2.0': 'n.coords.bbox.corner_ne'
        },
        "coords_corner_sw": {
            '1.0': '',
            '2.0': 'n.coords.bbox.corner_sw'
        },
        "coords_range": {
            '1.0': 'range',
            '2.0': 'n.coords.bbox'
        },
        "coords_center": {
            '1.0': 'center',
            '2.0': 'n.coords.center'
        },
        "shelf_locator": {
            '1.0': 'mods.shelfLocator',
            '2.0': 'n.shelf_locator'
        },
        "text": {
            '1.0': 'text',
            '2.0': 'text'
        },
        "level": {
            '1.0': 'level',
            '2.0': 'level'
        },
        "root_pid": {
            '1.0': 'root_pid',
            '2.0': 'n.root.pid'
        },
        "root_model": {
            '1.0': 'root_model',
            '2.0': 'n.root.model'
        },
        "root_title": {
            '1.0': 'root_title',
            '2.0': 'n.root.title'
        },
        "model_path": {
            '1.0': 'model_path',
            '2.0': 'model_path'
        },
        "pid_path": {
            '1.0': 'pid_path',
            '2.0': 'pid_path'
        },
        "date_from": {
            '1.0': 'datum_begin',
            '2.0': 'n.date.min'
        },
        "date_to": {
            '1.0': 'datum_end',
            '2.0': 'n.date.max'
        },
        "date_year": {
            '1.0': 'rok',
            '2.0': 'n.date_instant.year'
        },
        "date_year_from": {
            '1.0': 'datum_begin',
            '2.0': 'n.date_range_start.year'
        },
        "date_year_to": {
            '1.0': 'datum_begin',
            '2.0': 'n.date_range_end.year'
        },
        "parent_pid": {
            '1.0': 'parent_pid',
            '2.0': 'n.own_parent.pid'
        },
        "volume_year": {
            '1.0': '',
            '2.0': 'n.volume.year'
        },
        "volume_number": {
            '1.0': '',
            '2.0': 'n.volume.number.str'
        },
        "volume_number_sort": {
            '1.0': '',
            '2.0': 'n.volume.number.int'
        },
        "issue_date": {
            '1.0': '',
            '2.0': 'n.issue.date'
        },
        "issue_number": {
            '1.0': '',
            '2.0': 'n.issue.number.str'
        },
        "issue_number_sort": {
            '1.0': '',
            '2.0': 'n.issue.number.int'
        },
        "unit_name": {
            '1.0': '',
            '2.0': 'n.unit.name'
        },
        "unit_number": {
            '1.0': '',
            '2.0': 'n.unit.number'
        },
        "unit_number_sort": {
            '1.0': '',
            '2.0': 'n.unit.number'
        },
        "rels_ext_index": {
            '1.0': 'rels_ext_index',
            '2.0': 'n.rels_ext_index.sort'
        }
    }

    public static allDoctypes = ['periodical', 'monographbundle', 'monograph', 'clippingsvolume', 'map', 'sheetmusic', 'graphic',
    'archive', 'soundrecording', 'manuscript', 'monographunit',
    'soundunit', 'track', 'periodicalvolume', 'periodicalitem',
    'article', 'internalpart', 'supplement', 'page'];


    constructor(private settings: AppSettings, private utils: Utils) {
    }

    version(): string {
        return this.settings.schemaVersion;
    }

    private oldSchema(): boolean {
        return this.version() === '1.0';
    }

    field(name: string): string {
        return SolrService.fields[name][this.version()];
    }

    buildTopLevelFilter(): string {
        const field = this.field('model');
        let filter =  `${field}:${this.settings.doctypes.join(` OR ${field}:`)}`;
        if (this.settings.doctypes.indexOf('monograph') >= 0) {
            filter = `${filter} OR ${field}:monographunit`
        }
        return filter;
    }

    getNewestQuery(): string {
        return `fl=${this.field('id')},${this.field('accessibility')},${this.field('authors')},${this.field('title')},${this.field('date')},${this.field('model')}&q=${this.field('accessibility')}:public&fq=${this.buildTopLevelFilter()}&sort=${this.field('created_at')} desc&rows=24&start=0`;
    }




    private getOrderingValue(query: SearchQuery): string {
        if (query.ordering === 'newest') {
            return `${this.field('created_at')} desc`;
        } else if (query.ordering === 'latest') {
            return `${this.field('date_to')} desc`;
        } else if (query.ordering === 'earliest') {
            return `${this.field('date_from')} asc`;
        } else if (query.ordering === 'alphabetical') {
            if (query.getRawQ()) {
                return `${this.field('root_title')} asc`;
            } else {
                return `${this.field('title_sort')} asc`;
            }
        }
        return null;
    }




    private buildPeriodicalQuery(parent: string, level: number, models: string[], query: PeriodicalQuery, applyYear: boolean): string {
        const modelRestriction = models.map(a => `${this.field('model')}:` + a).join(' OR ');
        let q = `fl=${this.field('id')},${this.field('accessibility')},${this.field('model')},${this.field('title')},${this.field('date')}`;
        if (this.oldSchema()) {
            q += ',details';
        } else {
            if (models.indexOf('periodicalvolume') > -1) {
                q += `,${this.field('volume_year')},${this.field('volume_number')}`;
            }            
            if (models.indexOf('periodicalitem') > -1) {
                q += `,${this.field('issue_date')},${this.field('issue_number')}`;
            }        
            if (models.indexOf('monographunit') > -1) {
                q += `,${this.field('unit_name')},${this.field('unit_number')}`;
            }
        }
        if (this.settings.dnntFilter) {
            q += `,${this.field('dnnt')}`;
        }
        // q += `&q=${this.field('parent_pid')}:${parent}/* AND ${this.field('level')}:${level} AND (${modelRestriction})`;
        q += `&q=${this.field('parent_pid')}:${parent} AND (${modelRestriction})`;
        if (query && (query.accessibility === 'private' || query.accessibility === 'public')) {
            q += ` AND ${this.field('accessibility')}: ${query.accessibility}`;
        }
        if (query && applyYear && query.isYearRangeSet()) {
            q += `(${this.field('date_year')}:[${query.from} TO ${query.to}] OR (${this.field('date_year_from')}:[* TO ${query.to}] AND ${this.field('date_year_to')}:[${query.from} TO *]))`
        }
        q += '&sort=';
        if (level > 1) {
            q += this.oldSchema() ? 'datum asc,' : `${this.field('date_from')} asc,`;
        }
        q += `${this.field('date')} asc,${this.field('model')} asc,${this.field('title')} asc&rows=1500&start=0`;
        return q;
    }



    buildPeriodicalVolumesQuery(uuid: string, query: PeriodicalQuery) {
        return this.buildPeriodicalQuery(this.utils.escapeUuid(uuid), 1, ['periodicalvolume'], query, true);
    }

    // buildPeriodicalIssuesQuery(periodicalUuid: string, volumeUuid: string, query: PeriodicalQuery) {
    //     const pidPath = this.utils.escapeUuid(periodicalUuid) + '/' + this.utils.escapeUuid(volumeUuid);
    //     return this.buildPeriodicalQuery(pidPath, 2, ['periodicalitem', 'supplement', 'page'], query, false);
    // }


    buildPeriodicalIssuesQuery(uuid: string, query: PeriodicalQuery) {
        return this.buildPeriodicalQuery(this.utils.escapeUuid(uuid), 2, ['periodicalitem', 'supplement', 'page'], query, false);
    }

    buildMonographUnitsQuery(uuid: string, query: PeriodicalQuery) {
        return this.buildPeriodicalQuery(this.utils.escapeUuid(uuid), 1, ['monographunit', 'page'], query, false);
    }


    buildBrowseQuery(query: BrowseQuery): string {
        let q = 'q=(' + this.buildTopLevelFilter() + ')';
        if (query.accessibility === 'public' && this.settings.filters.includes('accessibility')) {
            q += ` AND ${this.field('accessibility')}:public`;
        } else if (query.accessibility === 'private') {
            q += ` AND ${this.field('accessibility')}:private`;
        }
        if (query.textSearch()) {
            for (const word of query.text.split(' ')) {
                q += ` AND ${this.getSearchField(query.category)}:${word.trim()}*`;
            }
        }
        let ordering = 'count';
        if (query.ordering === 'alphabetical' && query.category !== 'collections') {
            ordering = 'index';
        } 
        q += '&facet=true&facet.field=' + this.getFilterField(query.category)
           + '&facet.mincount=1'
           + '&facet.sort=' + ordering
           + '&facet.limit=' + query.getRows()
           + '&facet.offset=' + query.getStart()
           + '&rows=0';
        if (query.text) {
            const firstWord = query.text.split(" ")[0].trim();
            q += '&facet.contains=' + firstWord + '&facet.contains.ignoreCase=true';
        }
         q += '&json.facet={x:"unique(' + this.getFilterField(query.category) + ')"}';

        return q;
    }


    browseFacetList(solr, query: BrowseQuery) {
        const field = this.getFilterField(query.category);
        const list = [];
        const facetFields = solr['facet_counts']['facet_fields'][field];
        for (let i = 0; i < facetFields.length; i += 2) {
            const value = facetFields[i];
            if (!value) {
                continue;
            }
            let check = true;
            if (query.textSearch()) {
                for (const word of query.text.split(' ')) {
                    if (value.toLowerCase().indexOf(word.toLowerCase()) < 0) {
                        check = false;
                        continue;
                    }
                }
            }
            if (!check) {
                continue;
            }
            const count = facetFields[i + 1];
            const item = {'value' : value, 'count': count, name: value};
            if (field === 'language' || field === 'fedora.model' || field === 'collection') {
                item['name'] = '';
            }
            list.push(item);
        }
        if (field === 'fedora.model') {
            this.mergeBrowseMonographsAndMonographUnits(list);
        }
        return list;
    }





    buildSearchQuery(query: SearchQuery, facet: string = null) {
        let qString = query.getQ();
        let value = qString;
        let q = 'q=';
        if (query.dsq) {
            q += query.dsq + ' AND '
        }
        if (query.isBoundingBoxSet()) {
            q += `{!field f=${this.field('coords_range')} score=overlapRatio}Intersects(ENVELOPE(${query.west},${query.east},${query.north},${query.south}))&fq=`;
        }
        if (query.isCustomFieldSet()) {
            value = query.value;
            q +=  SearchQuery.getSolrCustomField(query.field) + ':' + query.value;
        } else if (qString) {
            q += `_query_:"{!edismax qf=\'${this.field('titles_search')}^10 ${this.field('authors_search')}^2 ${this.field('text')}^0.1 ${this.field('shelf_locator')}\' bq=\'(${this.field('level')}:0)^20\' bq=\'(${this.field('accessibility')}:public)^2\' bq=\'(${this.field('model')}:page)^0.1\' v=$q1}\"`;
        } else {
            q += '*:*';
        }
        const fq = this.buildFilterQuery(query, facet);
        if (fq) {
            q += '&fq=' + fq;
        }
        if (qString || query.isCustomFieldSet()) {
            q += `&q1=${value}&group=true&group.field=${this.field('root_pid')}&group.ngroups=true&group.sort=score desc`;
            q += '&group.truncate=true';
            q += `&fl=${this.field('id')},${this.field('accessibility')},${this.field('model_path')},${this.field('authors')},${this.field('root_title')},${this.field('root_pid')},${this.field('title')},${this.field('date')},score`;
        } else {
            q += `&fl=${this.field('id')},${this.field('accessibility')},${this.field('model')},${this.field('authors')},${this.field('title')},${this.field('date')}`;
        }
        if (this.settings.dnntFilter) {
            q += `,${this.field('dnnt')}`;
        }
        if (query.isBoundingBoxSet()) {
            if (this.oldSchema()) {
                q += `,${this.field('coords_location')}`;
            } else {
                q += `,${this.field('coords_corner_ne')},${this.field('coords_corner_sw')}`;
            }
            q += `,${this.field('geonames_facet')}`;
        }
        q += '&facet=true&facet.mincount=1'
           + this.addFacetToQuery(facet, 'keywords', query.keywords.length === 0)
           + this.addFacetToQuery(facet, 'languages', query.languages.length === 0)
           + this.addFacetToQuery(facet, 'locations', query.locations.length === 0)
           + this.addFacetToQuery(facet, 'geonames', query.geonames.length === 0)
           + this.addFacetToQuery(facet, 'authors', query.authors.length === 0)
           + this.addFacetToQuery(facet, 'collections', query.collections.length === 0)
           + this.addFacetToQuery(facet, 'publishers', query.collections.length === 0)
           + this.addFacetToQuery(facet, 'doctypes', query.doctypes.length === 0)
           + this.addFacetToQuery(facet, 'genres', query.genres.length === 0)
           + this.addFacetToQuery(facet, 'accessibility',  query.accessibility === 'all');
        if (this.settings.dnntFilter) {
            q += '&facet.field=dnnt';
        }
        if (facet) {
            q += '&rows=0';
        } else if (query.isBoundingBoxSet()) {
            q += '&rows=' + '100' + '&start=' + '0';
        } else {
            const ordering = this.getOrderingValue(query);
            if (ordering) {
                q += '&sort=' + ordering;
            }
            q += '&rows=' + query.getRows() + '&start=' + query.getStart();
        }
        return q;
    }


    buildFilterQuery(query: SearchQuery, facet: string = null): string {
        let fqFilters = [];
        if (query.getQ() || query.isCustomFieldSet()) {
            fqFilters.push(`(${this.buildTopLevelFilter()} OR ${this.field('model')}:page OR ${this.field('model')}:article)`);
        } else {
            fqFilters.push(`(${this.buildTopLevelFilter()})`);
        }
        if (facet !== 'accessibility' && this.settings.filters.indexOf('accessibility') > -1) {
            if (query.accessibility === 'public') {
                fqFilters.push(`${this.field('accessibility')}:public`);
            } else if (query.accessibility === 'private') {
                fqFilters.push(`${this.field('accessibility')}:private`);
            } else if (this.settings.dnntFilter && query.accessibility === 'dnnt') {
                fqFilters.push(`${this.field('dnnt')}:true`);
            }
        }
        if (query.isYearRangeSet()) {
            const from = query.from === 0 ? 1 : query.from;
            fqFilters.push(`(${this.field('date_year')}:[${from} TO ${query.to}] OR (${this.field('date_year_from')}:[* TO ${query.to}] AND ${this.field('date_year_to')}:[${from} TO *]))`);
        }
        const withQueryString = query.hasQueryString();
        fqFilters.push(this.buildFacetFilter(withQueryString, 'keywords', query.keywords, facet));
        fqFilters.push(this.buildFacetFilter(withQueryString, 'doctypes', query.doctypes, facet));
        fqFilters.push(this.buildFacetFilter(withQueryString, 'authors', query.authors, facet));
        fqFilters.push(this.buildFacetFilter(withQueryString, 'languages', query.languages, facet));
        fqFilters.push(this.buildFacetFilter(withQueryString, 'locations', query.locations, facet));
        fqFilters.push(this.buildFacetFilter(withQueryString, 'geonames', query.geonames, facet));
        fqFilters.push(this.buildFacetFilter(withQueryString, 'collections', query.collections, facet));
        fqFilters.push(this.buildFacetFilter(withQueryString, 'publishers', query.publishers, facet));
        fqFilters.push(this.buildFacetFilter(withQueryString, 'genres', query.genres, facet));
        if (!query.isBoundingBoxSet() && this.oldSchema()) {
            fqFilters.push(this.getDateOrderingRestriction(query));
        }
        fqFilters = fqFilters.filter( (el) => {
            return el != null && el !== '';
        });
        return fqFilters.join(' AND ');
    }


    private addFacetToQuery(facet: string, field: string, apply: boolean): string {
        if (this.settings.filters.indexOf(field) > -1) {
            if ((!facet && apply) || field === facet) {
                const f = field === 'doctypes' ? this.field('model_path') : this.getFilterField(field);
                return '&facet.field=' + f;
            }
        }
        return '';
    }


    private getDateOrderingRestriction(query: SearchQuery) {
        if (query.ordering === 'latest') {
            return `${this.field('date_year_from')}: [1 TO 3000]`;
        } else if (query.ordering === 'earliest') {
            return `${this.field('date_year_to')}: [1 TO 3000]`;
        }
    }



    private buildFacetFilter(withQueryString: boolean, field: string, values: string[], skip: string) {
        if (skip !== field  && values.length > 0 && this.settings.filters.indexOf(field) > -1) {
            if (field === 'doctypes') {
                const field = this.field('model');
                if (withQueryString) {
                    return  `(${field}:${values.join(`* OR ${field}:`)}*)`;
                } else {
                    let filter = `${field}:${values.join(` OR ${field}:`)}`;
                    if (values.indexOf('monograph') >= 0) {
                        filter = `${filter} OR ${field}:monographunit`
                    }
                    return `(${filter})`;
                }
            } else {
                return `(${this.getSearchField(field)}:"${values.join(`" OR ${this.getSearchField(field)}:"`)}")`;
            }
        }
    }






    getFilterField(field): string {
        if (field === 'keywords') {
            return this.field('keywords_facet');
        } else if (field === 'publishers') {
            return this.field('publishers_facet');
        } else if (field === 'authors') {
            return this.field('authors_facet');
        } else if (field === 'doctypes') {
            return this.field('model');
        } else if (field === 'categories') {
            return 'document_type';
        } else if (field === 'languages') {
            return this.field('languages_facet');
        } else if (field === 'locations') {
            return this.field('locations_facet');
        } else if (field === 'geonames') {
            return this.field('geonames_facet');
        } else if (field === 'genres') {
            return this.field('genres_facet');
        } else if (field === 'collections') {
            return 'collection';
        } else if (field === 'accessibility') {
            return this.field('accessibility');
        }
        return '';
    }

    getSearchField(field): string {
        if (field === 'keywords') {
            return this.field('keywords_search');
        } else if (field === 'publishers') {
            return this.field('publishers_search');
        } else if (field === 'authors') {
            return this.field('authors_search');
        } else if (field === 'doctypes') {
            return this.field('model');
        } else if (field === 'categories') {
            return 'document_type';
        } else if (field === 'languages') {
            return this.field('languages_search');
        } else if (field === 'locations') {
            return this.field('locations_search');
        } else if (field === 'geonames') {
            return this.field('geonames_search');
        } else if (field === 'genres') {
            return this.field('genres_search');
        } else if (field === 'collections') {
            return 'collection';
        } else if (field === 'accessibility') {
            return this.field('accessibility');
        }
        return '';
    }

    documentItems(json): DocumentItem[] {
        const items: DocumentItem[] = [];
        for (const doc of json['response']['docs']) {
            const item = new DocumentItem();
            item.title = doc[this.field('title')];
            if (item.title === 'null') {
                item.title = '-';
            }
            item.uuid = doc[this.field('id')];
            item.public = doc[this.field('accessibility')] === 'public';
            item.doctype = doc[this.field('model')];
            item.date = doc[this.field('date')];
            item.authors = doc[this.field('authors')];
            item.dnnt = !!doc[this.field('dnnt')];
            item.geonames = doc[this.field('geonames_facet')];
            if (this.oldSchema()) {
                this.parseLocationOld(doc[this.field('coords_location')], item);
            } else {
                this.parseLocation(doc[this.field('coords_corner_ne')], doc[this.field('coords_corner_sw')], item);
            }
            item.resolveUrl(this.settings.getPathPrefix());
            items.push(item);
        }
        return items;
    }

    private parseLocationOld(location: string, document: DocumentItem) {
        if (!location || !location[0] || !location[1] || location[0].indexOf(',') < 0 || location[1].indexOf(',') < 0) {
            return;
        }
        document.south = +location[0].split(',')[0];
        document.north = +location[1].split(',')[0];
        document.west = +location[0].split(',')[1];
        document.east = +location[1].split(',')[1];
    }

    private parseLocation(ne: string, sw: string, document: DocumentItem) {
        if (!ne || !sw || ne.indexOf(',') < 0 || sw.indexOf(',') < 0) {
            return;
        }
        document.south = +sw.split(',')[0];
        document.north = +ne.split(',')[0];
        document.west = +sw.split(',')[1];
        document.east = +ne.split(',')[1];
    }





    facetList(json, field: string, usedFiltes: any[], skipSelected: boolean) {
        const list = [];
        const facetFields = json['facet_counts']['facet_fields'][field];
        if (!facetFields) {
            return list;
        }
        for (let i = 0; i < facetFields.length; i += 2) {
            let value = facetFields[i];
            if (!value) {
                continue;
            }
            if (this.getFilterField('locations') === field) {
                if (/^[a-z]{3}[0-9]{3}$/.test(value)) {
                   value = value.toUpperCase();
                }
                if (this.settings.schemaVersion === '1.0' && !/^[A-Z]{3}[0-9]{3}$/.test(value)) {
                    continue;
                }
            }
            const count = facetFields[i + 1];
            const selected = usedFiltes && usedFiltes.indexOf(value) >= 0;
            if (!selected) {
                list.push({'value' : value, 'count': count, 'selected': false});
            } else if (!skipSelected) {
                list.push({'value' : value, 'count': count, 'selected': true});
            }
        }
        return list;
    }


    facetDoctypeList(solr, joinedDocytypes: boolean, doctypes: string[]) {
        const map = {};
        for (const doctype of doctypes) {
            map[doctype] = 0;
        }
        const list = [];
        const facetFields = solr['facet_counts']['facet_fields'][this.field('model_path')];
        for (let i = 0; i < facetFields.length; i += 2) {
            const f = facetFields[i];
            if (f.indexOf('/') < 0) {
                if (map[f] !== undefined) {
                    map[f] += facetFields[i + 1];
                }
            } else if (!joinedDocytypes) {
                const ff = f.split('/')[0];
                if (map[ff] !== undefined) {
                    map[ff] += facetFields[i + 1];
                }
            }
        }
        for (const doctype of doctypes) {
            list.push({'value' : doctype, 'count': map[doctype]});
        }
        return list;
    }

    facetAccessibilityList(solr) {
        const list = [];
        let allDocs = 0;
        let privateDocs = 0;
        let publicDocs = 0;
        const facetFields = solr['facet_counts']['facet_fields'][this.field('accessibility')];
        for (let i = 0; i < facetFields.length; i += 2) {
            if (facetFields[i] === 'public') {
                publicDocs = facetFields[i + 1];
            } else if (facetFields[i] === 'private') {
                privateDocs = facetFields[i + 1];
            }
            allDocs += facetFields[i + 1];
        }
        list.push({'value' : 'public', 'count': publicDocs});
        list.push({'value' : 'private', 'count': privateDocs});
        list.push({'value' : 'all', 'count': allDocs});
        if (this.settings.dnntFilter) {
            const dnnt = solr['facet_counts']['facet_fields'][this.field('dnnt')];
            let dnntCount = 0;
            for (let i = 0; i < dnnt.length; i += 2) {
                if (dnnt[i] === 'true') {
                    dnntCount = dnnt[i + 1];
                }
            }
            list.push({'value' : 'dnnt', 'count': dnntCount});

        }
        return list;
    }




    numberOfSearchResults(solr): number {
        return solr['grouped'][this.field('root_pid')]['ngroups'];
    }

    numberOfResults(solr): number {
        return solr['response']['numFound'];
    }









    periodicalItems(solr, doctype: string, uuid: string = null): PeriodicalItem[] {
        let hasVirtualIssue = false;
        let virtualIssuePublic: boolean;
        const items: PeriodicalItem[] = [];
        for (const doc of solr['response']['docs']) {
            if (doc[this.field('model')] === 'page') {
                hasVirtualIssue = true;
                virtualIssuePublic = doc[this.field('accessibility')] === 'public';
                continue;
            }
            items.push(this.periodicalItem(doc));
        }
        if (hasVirtualIssue) {
            const item = new PeriodicalItem();
            item.uuid = uuid;
            item.public = virtualIssuePublic;
            item.doctype = doctype;
            item.virtual = true;
            items.push(item);
        }
        return items;
    }




    periodicalItem(doc): PeriodicalItem {
        const item = new PeriodicalItem();
        item.uuid = doc[this.field('id')];
        item.public = doc[this.field('accessibility')] === 'public';
        item.doctype = doc[this.field('model')];
        item.dnnt = !!doc[this.field('dnnt')];
        if (this.oldSchema()) {
            this.periodicalItemOld(doc, item);
            return item;
        }
        if (item.doctype === 'periodicalvolume') {
            item.title = doc[this.field('volume_year')] || doc[this.field('date')];
            item.subtitle = doc[this.field('volume_number')];
        } else if (item.doctype === 'periodicalitem') {
            item.title = doc[this.field('issue_date')] || doc[this.field('date')];
            item.subtitle = doc[this.field('issue_number')];
        } else if (item.doctype === 'monographunit') {
            item.title = doc[this.field('unit_name')];
            item.subtitle = doc[this.field('unit_number')];
        }
        // TODO
        // if (item.doctype === 'supplement') {
        //     if (item.subtitle && item.subtitle.indexOf('.')) {
        //         item.subtitle = item.subtitle.substring(item.subtitle.indexOf('.') + 1);
        //   } else {
        //         item.subtitle = '';
        //   }
        // }
        return item;
    }




    periodicalItemOld(doc, item: PeriodicalItem) {
        const details = doc['details'];
        if (item.doctype === 'periodicalvolume') {
            if (details && details[0]) {
                const parts = details[0].split('##');
                if (parts.length >= 2) {
                    item.title = parts[0];
                    item.subtitle = parts[1];
                }
            }
        } else if (item.doctype === 'periodicalitem') {
            if (details && details[0]) {
                const parts = details[0].split('##');
                if (parts.length === 4) {
                    item.title = parts[2];
                    item.subtitle = parts[1];
                    if (!item.subtitle) {
                        item.subtitle = parts[3];
                    }
                }
            }
        } else if (item.doctype === 'monographunit') {
            if (details && details[0]) {
                const parts = details[0].split('##');
                if (parts.length === 2) {
                    item.title = parts[1];
                    item.subtitle = parts[0];
                }
            }
        }

        if (!item.title) {
            item.title = doc['datum_str'];
        }
        if (!item.subtitle) {
            item.subtitle = doc['dc.title'];
        }
        if (item.doctype === 'supplement') {
            if (item.subtitle && item.subtitle.indexOf('.')) {
                item.subtitle = item.subtitle.substring(item.subtitle.indexOf('.') + 1);
          } else {
                item.subtitle = '';
          }
        }
    }













    searchResultItems(solr, query: SearchQuery): DocumentItem[] {
        const items: DocumentItem[] = [];
        for (const group of solr['grouped'][this.field('root_pid')]['groups']) {
            const doclist = group['doclist'];
            const doc = doclist['docs'][0];
            const item = new DocumentItem();
            item.uuid = doc[this.field('root_pid')];
            item.public = doc[this.field('accessibility')] === 'public';
            const dp = doc[this.field('model_path')][0];
            const params = {};
            item.title = doc[this.field('title')];
            if (dp.indexOf('/') > 0) {
                item.title = doc[this.field('root_title')];
                item.doctype = dp.substring(0, dp.indexOf('/'));
                params['fulltext'] = query.getRawQ();
                if (query.isCustomFieldSet()) {
                    params['fulltext'] = query.getCustomValue();
                }
                item.hits = doclist['numFound'];
            } else {
                item.doctype = dp;
            }
            if (item.title === 'null') {
                item.title = '-';
            }
            if (item.doctype === 'periodical') {
                if (query.accessibility !== 'all') {
                    params['accessibility'] = query.accessibility;
                }
                if (query.isYearRangeSet()) {
                    params['from'] = query.from;
                    params['to'] = query.to;
                }
            }
            item.date = doc[this.field('date')];
            item.authors = doc[this.field('authors')];
            item.dnnt = !!doc[this.field('dnnt')];
            item.geonames = doc[this.field('geonames_facet')];
            if (this.oldSchema()) {
                this.parseLocationOld(doc[this.field('coords_location')], item);
            } else {
                this.parseLocation(doc[this.field('coords_corner_ne')], doc[this.field('coords_corner_sw')], item);
            }

            item.resolveUrl(this.settings.getPathPrefix());
            item.params = params;
            items.push(item);
        }
        return items;
    }



    periodicalFtItems(solr, query: string): PeriodicalFtItem[] {
        const items: PeriodicalFtItem[] = [];
        for (const doc of solr['response']['docs']) {
            const item = new PeriodicalFtItem();
            item.uuid = doc['PID'];
            item.public = doc['dostupnost'] === 'public';
            if (doc['fedora.model'] === 'article') {
                item.type = 'article';
                item.authors = doc['dc.creator'];
                item.title = doc['dc.title'];
            } else if (doc['fedora.model'] === 'monographunit') {
                item.type = 'monograph_unit';
                const pItem = this.periodicalItem(doc);
                item.title = pItem.title;
                item.part = pItem.subtitle;
            } else {
                item.type = 'page';
                item.page = doc['dc.title'];
                item.query = query;
            }
            if (doc['pid_path'].length > 0 && doc['model_path'].length > 0) {
                const pp = doc['pid_path'][0].replace(/\@/, '/');
                const pidPath = pp.split('/');
                const modelPath = doc['model_path'][0].split('/');
                for (let i = 0; i < modelPath.length; i++) {
                    const model = modelPath[i];
                    item.context[model] = pidPath[i];
                }
                // if (pidPath.length > 1) {
                //     item.issueUuid = pidPath[pidPath.length - 2];
                // }
                // if (pidPath.length > 2) {
                //     item.volumeUuid = pidPath[pidPath.length - 3];
                // }
                const uuid = item.uuid.replace(/\@/, '/@');
                if (solr['highlighting'][uuid]) {
                    const ocr = solr['highlighting'][uuid]['text'];
                    if (ocr) {
                        item.text = ocr[0];
                    }
                }
            }
            items.push(item);
        }

        return items;
    }

    numberOfFacets(solr): number {
        if (solr['facets']) {
            return solr['facets']['x'];
        }
        return 100;
    }

    uuidList(solr): string[] {
        const list = [];
        for (const doc of solr['response']['docs']) {
            list.push(doc['PID']);
        }
        return list;
    }




    private mergeBrowseMonographsAndMonographUnits(list: any[]) {
        let monograph;
        let monographunit;
        for (const item of list) {
            if (item.value === 'monograph') {
                monograph = item;
            } else if (item.value === 'monographunit') {
                monographunit = item;
            }
        }
        if (monographunit) {
            if (!monograph) {
                list.push( {'value' : 'monograph', 'count': monographunit.count, name: 'monograph' } );
            } else {
                monograph.count += monographunit.count;
                list.splice(list.indexOf(monographunit), 1);
            }
        }
    }


}

import { AppSettings } from './app-settings';
import { SearchQuery } from './../search/search_query.model';
import { PeriodicalFtItem } from './../model/periodicalftItem.model';
import { DocumentItem, Context } from './../model/document_item.model';
import { PeriodicalItem } from './../model/periodicalItem.model';
import { Injectable } from '@angular/core';
import { BrowseQuery } from '../browse/browse_query.model';
import { PeriodicalQuery } from '../periodical/periodical_query.model';
import { Utils } from './utils.service';
import { CompleterItem } from 'ng2-completer';
import { BrowseItem } from '../model/browse_item.model';


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
        'publication_places_search': {
            '1.0': '',
            '2.0': 'n.publication_places.search'
        },
        'publication_places_facet': {
            '1.0': '',
            '2.0': 'n.publication_places.facet'
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
        'root_title_sort': {
            '1.0': 'root_title',
            '2.0': 'n.root.title.sort'
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
            '2.0': 'n.own_model_path'
        },
        "pid_path": {
            '1.0': 'pid_path',
            '2.0': 'n.own_pid_path'
        },
        'date': {
            '1.0': 'datum_str',
            '2.0': 'n.date.str'
        },
        "date_from_sort": {
            '1.0': 'datum',
            '2.0': 'n.date.min'
        },   
        "date_to_sort": {
            '1.0': 'datum',
            '2.0': 'n.date.max'
        },       
        "date_from": {
            '1.0': 'datum_begin',
            '2.0': 'n.date.min'
        },
        "date_to": {
            '1.0': 'datum_end',
            '2.0': 'n.date.max'
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
        "step_parent_pid": {
            '1.0': '',
            '2.0': 'n.foster_parents.pids'
        },
        // "volume_year": {
        //     '1.0': '',
        //     '2.0': 'n.volume.year'
        // },
        // "volume_number": {
        //     '1.0': '',
        //     '2.0': 'n.volume.number.str'
        // },
        // "volume_number_sort": {
        //     '1.0': '',
        //     '2.0': 'n.volume.number.int'
        // },
        // "issue_date": {
        //     '1.0': '',
        //     '2.0': 'n.issue.date'
        // },
        // "issue_number": {
        //     '1.0': '',
        //     '2.0': 'n.issue.number.str'
        // },
        // "issue_number_sort": {
        //     '1.0': '',
        //     '2.0': 'n.issue.number.int'
        // },
        // "unit_name": {
        //     '1.0': '',
        //     '2.0': 'n.unit.name'
        // },
        // "unit_number": {
        //     '1.0': '',
        //     '2.0': 'n.unit.number'
        // },
        // "unit_number_sort": {
        //     '1.0': '',
        //     '2.0': 'n.unit.number'
        // },
        "rels_ext_index": {
            '1.0': 'rels_ext_index',
            '2.0': 'n.rels_ext_index.sort'
        },
        "text_ocr": {
            '1.0': 'text_ocr',
            '2.0': 'n.text_ocr'
        },
        "part_name": {
            '1.0': '',
            '2.0': 'n.part.name'
        },
        "part_number": {
            '1.0': '',
            '2.0': 'n.part.number.str'
        },
        "part_number_sort": {
            '1.0': '',
            '2.0': 'n.part.number.sort'
        },
        "collections": {
            '1.0': '',
            '2.0': 'n.collections'
        },
        "parent_collections": {
            '1.0': '',
            '2.0': 'n.in_collections.direct'
        },
        "ancestor_collections": {
            '1.0': '',
            '2.0': 'n.in_collections'
        },
        "is_top_collection": {
            '1.0': '',
            '2.0': 'n.collection.is_standalone'
        },
        "collection_description": {
            '1.0': '',
            '2.0': 'n.collection.desc'
        },
        'donators': {
            '1.0': '',
            '2.0': 'n.donator'
        },
        'page_type': {
            '1.0': '',
            '2.0': 'n.page.type'
        },
        'page_number': {
            '1.0': '',
            '2.0': 'n.page.number'
        },
        'has_tiles': {
            '1.0': '',
            '2.0': 'n.has_tile'
        },
        'img_full_mime': {
            '1.0': 'img_full_mime',
            '2.0': 'n.ds.img_full.mime'
        },
        "issue_type_sort": {
            '1.0': '',
            '2.0': 'n.issue.type.sort'
        },
        "issue_type": {
            '1.0': '',
            '2.0': 'n.issue.type.code'
        },
        "issn": {
            '1.0': 'issn',
            '2.0': 'n.id_issn'
        },
        "isbn": {
            '1.0': 'isbn',
            '2.0': 'n.id_isbn'
        }
    }

    public static allDoctypes = ['periodical', 'monographbundle', 'monograph', 'collection', 'clippingsvolume', 'map', 'sheetmusic', 'graphic',
    'archive', 'soundrecording', 'manuscript', 'monographunit',
    'soundunit', 'track', 'periodicalvolume', 'periodicalitem',
    'article', 'internalpart', 'supplement', 'page'];


    constructor(private settings: AppSettings, private utils: Utils) {
    }

    version(): string {
        return this.settings.schemaVersion;
    }

    private oldSchema(): boolean {
        return this.settings.oldSchema();
    }

    field(name: string): string {
        return SolrService.fields[name][this.version()];
    }

    private buildTopLevelFilter(topLevelCollectionsOnly: boolean): string {
        const field = this.field('model');
        let filter = `${field}:${this.settings.doctypes.join(` OR ${field}:`)}`;
        if (this.settings.doctypes.indexOf('monograph') >= 0) {
            filter = `${filter} OR ${field}:monographunit`
        }
        if (!this.oldSchema()) {
            if (topLevelCollectionsOnly) {
                filter = `${filter} OR (${field}:collection AND ${this.field('is_top_collection')}:true)`;                
            } else {
                filter = `${filter} OR ${field}:collection`;
            }
        }
        return filter;
    }
    // ${this.settings.dnntFilter ? ',dnnt' : ''}
    getNewestQuery(): string {
        let q = `fl=${this.field('id')},${this.field('accessibility')},${this.field('authors')},${this.field('title')},${this.field('date')},${this.field('model')}`;
        if (!this.oldSchema()) {
            q += `,${this.field('collection_description')}`;
        }
        if (this.settings.dnnt) {
            q += `,${this.field('dnnt')}`;
        }
        const pf = this.settings.newestAll ? '*:*' : `${this.field('accessibility')}:public`;
        q += `&q=${pf}&fq=${this.buildTopLevelFilter(true)}&sort=${this.field('created_at')} desc&rows=24&start=0`;
        return q;
    }

    private getOrderingValue(query: SearchQuery): string {
        if (query.ordering === 'newest') {
            return `${this.field('created_at')} desc`;
        } else if (query.ordering === 'latest') {
            return `${this.field('date_to_sort')} desc`;
        } else if (query.ordering === 'earliest') {
            return `${this.field('date_from_sort')} asc`;
        } else if (query.ordering === 'alphabetical') {
            if (query.getRawQ()) {
                return `${this.field('root_title_sort')} asc`;
            } else {
                return `${this.field('title_sort')} asc`;
            }
        }
        return null;
    }

    buildBookChildrenQuery(parent: string, own: boolean): string {
        let q = `fl=${this.field('id')},${this.field('accessibility')},${this.field('model')},${this.field('title')},${this.field('page_type')},${this.field('page_number')}`;
        if (this.settings.dnntFilter) {
            q += `,${this.field('dnnt')}`;
        }
        q += `&q=${this.field(own ? 'parent_pid' : 'step_parent_pid')}:"${parent}"`;
        q += `&sort=${this.field('rels_ext_index')} asc`;
        q += '&rows=2000&start=0';
        return q;
    }

    private buildPeriodicalQuery(parent: string, type: string, models: string[], query: PeriodicalQuery, applyYear: boolean): string {
        const modelRestriction = models.map(a => `${this.field('model')}:` + a).join(' OR ');
        let q = `fl=${this.field('id')},${this.field('accessibility')},${this.field('model')},${this.field('title')},${this.field('date')}`;
        if (this.oldSchema()) {
            q += ',details';
        } else {
            q += `,${this.field('part_name')},${this.field('part_number')},${this.field('date')},${this.field('issue_type')}`;
        }
        if (this.settings.dnntFilter) {
            q += `,${this.field('dnnt')}`;
        }
        q += `&q=${this.field('parent_pid')}:${parent} AND (${modelRestriction})`;
        if (query && (query.accessibility === 'private' || query.accessibility === 'public')) {
            q += ` AND ${this.field('accessibility')}: ${query.accessibility}`;
        }
        if (query && applyYear && query.isYearRangeSet()) {
            q += `(${this.field('date_year_from')}:[* TO ${query.to}] AND ${this.field('date_year_to')}:[${query.from} TO *])`
        }
        q += '&sort=';
        if (this.oldSchema()) {
            // OLD SCHEMA
            if (type === 'issue') {
                q += 'datum asc,';
            }
            q += `datum_str asc,fedora.model asc,dc.title asc`;
            //===========
        } else {
            if (type === 'unit') {
                q += `${this.field('rels_ext_index')} asc`;
            } else if (type === 'issue') {
                q += `${this.field('date_from_sort')} asc, ${this.field('part_number_sort')} asc, ${this.field('model')} asc, ${this.field('issue_type_sort')} asc`;
            } else {
                q += `${this.field('date_from_sort')} asc, ${this.field('part_number_sort')} asc, ${this.field('model')} asc`;
            }
        }
        q += '&rows=1500&start=0';
        return q;
    }



    buildPeriodicalVolumesQuery(uuid: string, query: PeriodicalQuery) {
        return this.buildPeriodicalQuery(this.utils.escapeUuid(uuid), 'volume', ['periodicalvolume'], query, true);
    }

    buildPeriodicalIssuesQuery(uuid: string, query: PeriodicalQuery) {
        return this.buildPeriodicalQuery(this.utils.escapeUuid(uuid), 'issue', ['periodicalitem', 'supplement', 'page'], query, false);
    }

    buildMonographUnitsQuery(uuid: string, query: PeriodicalQuery) {
        return this.buildPeriodicalQuery(this.utils.escapeUuid(uuid), 'unit', ['monographunit', 'page'], query, false);
    }

    buildPeriodicalItemsDetailsQuery(uuids: string[]) {
        let q = `fl=${this.field('id')},${this.field('model')},${this.field('date')}`;
        if (this.oldSchema()) {
            q += ',details,dc.title';
        } else {
            q += `,${this.field('part_name')},${this.field('part_number')}`;
        }
        q += `&q=${this.field('id')}:"${uuids.join(`" OR ${this.field('id')}:"`)}"&rows=50`;
        return q;
    }


    buildDocumentFulltextQuery(uuid: string, query: string) {
        const fl = this.field('id');
        const fq = `${this.field('parent_pid')}:"${uuid}" AND ${this.field('model')}:page`;
        const q = `_query_:"{!edismax qf=\'${this.field('text_ocr')}\' v=$q1}\"`;
        let term = this.buildQ(query);
        return `q=${q}&q1=${term}&fq=${fq}&fl=${fl}&rows=300&hl=true&hl.fl=${this.field('text_ocr')}&hl.mergeContiguous=true&hl.snippets=1&hl.fragsize=120&hl.simple.pre=<strong>&hl.simple.post=</strong>`;
    }

    documentFulltextQuery(solr): string[] {
        const list = [];
        for (const doc of solr['response']['docs']) {
            let snippet = "";
            const uuid = doc[this.field('id')];
            if (solr['highlighting'][uuid]) {
                const ocr = solr['highlighting'][uuid][this.field('text_ocr')];
                if (ocr) {
                    snippet = ocr[0];
                }
            }
            list.push({
                uuid: uuid,
                snippet: snippet
            });
        }
        return list;
    }


    buildBrowseQuery(query: BrowseQuery): string {
        let q = 'q=(' + this.buildTopLevelFilter(true) + ')';
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


    browseItems(solr, query: BrowseQuery): [BrowseItem[], number] {
        const field = this.getFilterField(query.category);
        const items = [];
        const facetFields = solr['facet_counts']['facet_fields'][field];
        const translatedFileds = [
            this.getFilterField('languages'), this.getFilterField('model'), this.getFilterField('collections')
        ];
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
            const item = new BrowseItem(value, value, count);
            if (translatedFileds.indexOf(field) > 0) {
                item.name = '';
            }
            items.push(item);
        }
        if (field === this.getFilterField('model')) {
            this.mergeBrowseMonographsAndMonographUnits(items);
        }
        const numberOfResults = query.textSearch() ? items.length : this.numberOfFacets(solr);
        return [items, numberOfResults];
    }


    private buildQ(term: string): string {
        if (!term || term === '*') {
            return null;
        }
        let q = term;
        if (!Utils.inQuotes(term)) {
            q = q.trim();
            while (q.indexOf('  ') > 0) {
                q = q.replace(/  /g, ' ');
            }
        }
        q = q.replace(/&/g, '')
        return q;
    }


    buildPeriodicalFulltextSearchQuery(periodicalUuid: string, volumeUuid: string, offset: number, limit: number, query: PeriodicalQuery): string {
        const fl = `${this.field('id')},${this.field('model')},${this.field('model_path')},${this.field('pid_path')},${this.field('authors')},${this.field('accessibility')},${this.field('title')}`;
        let fq = '';
        if (volumeUuid) {
            fq += `${this.field('pid_path')}:${this.utils.escapeUuid(periodicalUuid)}/${this.utils.escapeUuid(volumeUuid)}/*`;
        } else {
            fq += `${this.field('root_pid')}:"${periodicalUuid}"`;
        }
        if (query.accessibility === 'public' || query.accessibility === 'private') {
            fq += ` AND ${this.field('accessibility')}:${query.accessibility}`;
        }
        if (query.isYearRangeSet()) {
            fq += ` AND (${this.field('date_year_from')}:[* TO ${query.to}] AND ${this.field('date_year_to')}:[${query.from} TO *])`;
        }
        let term = this.buildQ(query.fulltext);
        const q = `_query_:"{!edismax qf=\'${this.field('titles_search')}^10 ${this.field('text_ocr')}^1\' v=$q1}\"`;
        let sort = '';
        if (query.ordering === 'latest') {
            sort = `${this.field('date_to_sort')} desc, ${this.field('date')} desc`;
        } else if (query.ordering === 'earliest') {
            sort = `${this.field('date_from_sort')} asc, ${this.field('date')} asc`;
        }
        return `q=${q}&q1=${term}&fq=${fq}&fl=${fl}&sort=${sort}&rows=${limit}&start=${offset}&hl=true&hl.fl=${this.field('text_ocr')}&hl.mergeContiguous=true&hl.snippets=1&hl.fragsize=120&hl.simple.pre=<strong>&hl.simple.post=</strong>`;
    }


    // buildPeriodicalFulltextSearchQuery(periodicalUuid: string, volumeUuid: string, offset: number, limit: number, query: PeriodicalQuery): string {
    //     let q = `fl=${this.field('id')},${this.field('model')},${this.field('model_path')},${this.field('pid_path')},${this.field('authors')},${this.field('accessibility')},${this.field('title')}&q=`;
    //     if (volumeUuid) {
    //         q += `${this.field('pid_path')}:${this.utils.escapeUuid(periodicalUuid)}/${this.utils.escapeUuid(volumeUuid)}/*`;
    //     } else {
    //         q += `${this.field('root_pid')}:"${periodicalUuid}"`;
    //     }
    //     if (query.accessibility === 'public' || query.accessibility === 'private') {
    //         q += ` AND ${this.field('accessibility')}:${query.accessibility}`;
    //     }
    //     if (query.isYearRangeSet()) {
    //         q += ` AND (${this.field('date_year_from')}:[* TO ${query.to}] AND ${this.field('date_year_to')}:[${query.from} TO *])`;
    //     }
    //     const term = query.fulltext;
    //     q += ` AND ((${this.field('model')}:page AND ${this.queryTerm(term, this.field('text_ocr'))}) OR ((${this.field('model')}:monographunit OR ${this.field('model')}:article) AND (${this.queryTerm(term, this.field('titles_search'))} OR ${this.queryTerm(term, this.field('authors_search'))} OR ${this.queryTerm(term, this.field('authors_search'))})))`;
    //     if (query.ordering === 'latest') {
    //         q += `&sort=${this.field('date_to_sort')} desc, ${this.field('date')} desc`;
    //     } else if (query.ordering === 'earliest') {
    //         q += `&sort=${this.field('date_from_sort')} asc, ${this.field('date')} asc`;
    //     }
    //     q += `&rows=${limit}&start=${offset}&hl=true&hl.fl=${this.field('text_ocr')}&hl.mergeContiguous=true&hl.snippets=1&hl.fragsize=120&hl.simple.pre=<strong>&hl.simple.post=</strong>`;
    //     return q;
    // }

    buildDocumentQuery(uuid: string): string {
        return `q=${this.field('id')}:"${uuid}"&rows=1`;
    }

    documentItem(solr): DocumentItem {
        if (!solr['response']['docs'] || solr['response']['docs'].lenght < 1) {
            return null;
        }
        const doc = solr['response']['docs'][0];
        const item = new DocumentItem();
        item.uuid = doc[this.field('id')];
        item.title = doc[this.field('title')];
        item.public = doc[this.field('accessibility')] === 'public';
        item.doctype = doc[this.field('model')];
        item.date = doc[this.field('date')];
        item.authors = doc[this.field('authors')];
        item.donators = doc[this.field('donators')];
        item.pdf = doc[this.field('img_full_mime')] == "application/pdf";
        item.dnnt = !!doc[this.field('dnnt')];
        item.root_uuid = doc[this.field('root_pid')];
        if (item.doctype === 'periodicalvolume') {
            item.volumeNumber = doc[this.field('part_number')];
            item.volumeYear = item.date;
        }
        const pidPath = this.getPidPath(doc);
        const modelPath = this.getModelPath(doc);
        if (pidPath && modelPath) {
            const pids = pidPath.split('/');
            const models = modelPath.split('/');
            for (let i = 0; i < models.length; i++) {
                const model = models[i];
                item.context.push(new Context(pids[i], model));            
            }
        }
        item.resolveUrl(this.settings.getPathPrefix());
        return item;
    }


    buildFulltextSearchAutocompleteQuery(term: string, uuid: string): string {
        const query = term.toLowerCase().trim() + '*';
        return `fl=${this.field('id')}&hl=true&hl.fl=${this.field('text_ocr')}&hl.fragsize=1&hl.simple.post=<<&hl.simple.pre=>>&hl.snippets=10&q=${this.field('parent_pid')}:"${uuid}"+AND+${this.field('text_ocr')}:${query}&rows=20`;
    }

    fulltextSearchAutocompleteResults(solr): CompleterItem[] {
        const items = [];
        if (solr && solr['highlighting']) {
            for (const [key, value] of Object.entries(solr['highlighting'])) {
                if (value[this.field('text_ocr')]) {
                    for (const ocr of value[this.field('text_ocr')]) {
                        const i1 = ocr.indexOf('>>');
                        const i2 = ocr.indexOf('<<');
                        if (i1 > -1 && i2 > -1) {
                            const text = ocr.substring(i1 + 2, i2).toLowerCase();
                            if (items.indexOf(text) < 0) {
                                items.push(text);
                            }
                        }
                    }
                }
            }
        }
        items.sort(function(a, b) {
            if (a < b) {
                return -1;
            }
            if (a > b) {
                return 1;
            }
            return 0;
        });
        const results: CompleterItem[] = [];
        for (const item of items) {
            results.push({
                title: item,
                originalObject: item
            });
        }
        return results;
    }

    buildSearchAutocompleteQuery(term: string, query: SearchQuery, publicOnly: boolean): string {
        let fq = null;
        if (query) {
            fq = this.buildFilterQuery(query, null, true);
        } else if (publicOnly) {
            fq = `${this.field('accessibility')}:public AND (${this.buildTopLevelFilter(false)})`;
        } else {
            fq = this.buildTopLevelFilter(false);
        }
        let t = term.toLowerCase().trim()
                        .replace(/"/g, '\\"').replace(/~/g, '\\~').replace(/&/g, '')
                        .replace(/:/g, '\\:').replace(/-/g, '\\-').replace(/\[/g, '\\[')
                        .replace(/\]/g, '\\]').replace(/!/g, '\\!');
        while (t.indexOf('  ') > 0) {
            t = t.replace(/  /g, ' ');
        }
        const searchField = this.field('title');
        let q = `defType=edismax&fl=${this.field('id')},${this.field('title')}&q=${searchField}:${t.split(' ').join(` AND  ${searchField}:`)}`;
        if (!term.endsWith(' ') && !term.endsWith(':')) {
            q+='*';
        }
        q += '&fq=' + fq;
        q += `&bq=${this.field('model')}:monograph^5&bq=${this.field('model')}:periodical^5&bq=${this.field('accessibility')}:public^5`;
        q += '&rows=50';
        return q;
    }

    private queryTerm(term: string, field: string): string {
        let text = term.toLowerCase().trim();
        const inQuotes = text.startsWith("\"") && text.endsWith("\"");
        if (inQuotes) {
            text = text.substring(1, text.length - 1).replace(/"/g, '\\"');
            return `${field}:"${text}"`;
        }
        text = text.replace(/"/g, '\\"').replace(/~/g, '\\~')
        .replace(/:/g, '\\:').replace(/-/g, '\\-').replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]').replace(/!/g, '\\!');
        while (text.indexOf('  ') > 0) {
            text = text.replace(/  /g, ' ');
        }
        return `(${field}:${text.split(" ").join(" AND " + field + ":")})`;
    }

    searchAutocompleteResults(solr, term: string): CompleterItem[] {
        const items = [];
        const cache = {};
        const titleFiled = this.field('title');
        for (const item of solr['response']['docs']) {
            const title = item[titleFiled];
            if (!title || cache[title]) {
                continue;
            }
            let index = title.toLowerCase().indexOf(term.toLowerCase());
            if (index < 0) {
                index = 1000 + title.length;
            }
            items.push({index: index, title: title});
            cache[title]  = true;
        }
        items.sort(function(a, b) {
            if (a.index < b.index) {
                return -1;
            }
            if (a.index > b.index) {
                return 1;
            }
            if (a.index === b.index) {
                return a.title.length - b.title.length;
            }
        });
        const result: CompleterItem[] = [];
        for (const item of items) {
            result.push( { title: item.title, originalObject: item. title} );
        }
        return result;
    }



    buildSearchQuery(query: SearchQuery, facet: string = null) {
        let qString = this.buildQ(query.query);
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
            let fields = '';
            if (query.field == 'all') {
                fields = ['title', 'author', 'keyword', 'geoname', 'signature', 'issn', 'fulltext'].map(f => this.getSolrCustomField(f, true)).join(' ');
            } else {
                fields = this.getSolrCustomField(query.field);
            }
            q += `_query_:"{!edismax qf=\'${fields}\' v=$q1}\"`;
        } else if (qString) {
            q += `_query_:"{!edismax qf=\'${this.field('titles_search')}^10 ${this.field('authors_search')}^2 ${this.field('keywords_search')} ${this.field('text_ocr')}^0.1 ${this.field('shelf_locator')}\' bq=\'(${this.field('level')}:0)^20\' bq=\'(${this.field('accessibility')}:public)^2\' bq=\'(${this.field('model')}:page)^0.1\' v=$q1}\"`;
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
        if (!this.oldSchema()) {
            q += `,${this.field('collection_description')}`;
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
           + this.addFacetToQuery(facet, 'publishers', query.publishers.length === 0)
           + this.addFacetToQuery(facet, 'places', query.places.length === 0)
           + this.addFacetToQuery(facet, 'doctypes', query.doctypes.length === 0)
           + this.addFacetToQuery(facet, 'genres', query.genres.length === 0)
           + this.addFacetToQuery(facet, 'accessibility',  query.accessibility === 'all');
        if (this.settings.dnntFilter) {
            q += `&facet.field=${this.field('dnnt')}`;
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


    private buildFilterQuery(query: SearchQuery, facet: string = null, fromAutocomplete = false): string {
        let fqFilters = [];
        if (query.collection) {
            if (this.buildQ(query.query) || query.isCustomFieldSet()) {
                fqFilters.push(`((${this.field('parent_collections')}:"${query.collection}") OR ((${this.field('model')}:page OR ${this.field('model')}:article) AND ${this.field('collections')}:"${query.collection}"))`);
            } else {
                fqFilters.push(`(${this.field('parent_collections')}:"${query.collection}")`);
            }
        } else {
            if (this.buildQ(query.query)|| query.isCustomFieldSet()) {
                fqFilters.push(`(${this.buildTopLevelFilter(false)} OR ${this.field('model')}:page OR ${this.field('model')}:article)`);
            } else {
                fqFilters.push(`(${this.buildTopLevelFilter(!fromAutocomplete)})`);
            }
        }
        if (facet == 'accessible') {
            fqFilters.push('(dnnt:true OR dostupnost:public)');
        } else if (facet !== 'accessibility' && this.settings.filters.indexOf('accessibility') > -1) {
            if (query.accessibility === 'public') {
                fqFilters.push(`${this.field('accessibility')}:public`);
            } else if (query.accessibility === 'private') {
                fqFilters.push(`${this.field('accessibility')}:private`);
            } else if (this.settings.dnntFilter && query.accessibility === 'dnnt') {
                fqFilters.push(`${this.field('dnnt')}:true`);
            } else if (this.settings.dnntFilter && query.accessibility === 'accessible') {
                fqFilters.push(`(${this.field('dnnt')}:true OR ${this.field('accessibility')}:public)`);
            }	            
        }
        if (query.isYearRangeSet()) {
            const from = query.from === 0 ? 1 : query.from;
            fqFilters.push(`(${this.field('date_year_from')}:[* TO ${query.to}] AND ${this.field('date_year_to')}:[${from} TO *])`);
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
        fqFilters.push(this.buildFacetFilter(withQueryString, 'places', query.places, facet));
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
                if (withQueryString) {
                    const field = this.field('model_path');
                    return  `(${field}:${values.join(`* OR ${field}:`)}*)`;
                } else {
                    const field = this.field('model');
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
        } else if (field === 'places') {
            return this.field('publication_places_facet');
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
        } else if (field === 'places') {
            return this.field('publication_places_search');
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
            item.description = doc[this.field('collection_description')];
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

        const types = this.oldSchema() ? doctypes : doctypes.concat(['collection']);
        for (const doctype of types) {
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
        for (const doctype of types) {
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
        if (this.settings.dnntFilter) {
            const dnnt = solr['facet_counts']['facet_fields'][this.field('dnnt')];
            let dnntCount = 0;
            for (let i = 0; i < dnnt.length; i += 2) {
                if (dnnt[i] === 'true') {
                    dnntCount = dnnt[i + 1];
                }
            }
            list.push({'value' : 'dnnt', 'count': dnntCount});
            // list.push({'value' : 'accessible', 'count': dnntCount + publicDocs});
        }
        list.push({'value' : 'all', 'count': allDocs});
        return list;
    }




    numberOfSearchResults(solr): number {
        return solr['grouped'][this.field('root_pid')]['ngroups'];
    }

    numberOfResults(solr): number {
        return solr['response']['numFound'];
    }





    periodicalFullTextItems(solr, query: string): PeriodicalFtItem[] {
        const items: PeriodicalFtItem[] = [];
        for (const doc of solr['response']['docs']) {
            const item = new PeriodicalFtItem();
            item.uuid = doc[this.field('id')];
            item.public = doc[this.field('accessibility')] === 'public';
            if (doc[this.field('model')] === 'article') {
                item.type = 'article';
                item.authors = doc[this.field('authors')];
                item.title = doc[this.field('title')];
            } else if (doc[this.field('model')] === 'monographunit') {
                item.type = 'monograph_unit';
                const pItem = this.periodicalItem(doc);
                item.title = pItem.name;
                item.part = pItem.number;
            } else {
                item.type = 'page';
                item.page = doc[this.field('title')];
                item.query = query;
            }
            const pidPath = this.getPidPath(doc);
            const modelPath = this.getModelPath(doc);
            console.log('pidPath', pidPath);
            if (pidPath && modelPath) {
                const pids = pidPath.split('/');
                const models = modelPath.split('/');
                for (let i = 0; i < models.length; i++) {
                    const model = models[i];
                    item.context[model] = pids[i];
                }
            }
            const uuid = item.uuid.replace(/\@/, '/@');
            if (solr['highlighting'][uuid]) {
                const ocr = solr['highlighting'][uuid][this.field('text_ocr')];
                if (ocr) {
                    item.text = ocr[0];
                }
            }
            items.push(item);
        }
        console.log('items', items);
        return items;
    }



    private getPath(type: string, doc): string {
        let path = doc[this.field(`${type}_path`)];
        if (!path) {
            return null;
        }
        if (this.oldSchema()) {
            return path.length > 0 ? path[0] : null;
        } else {
            return path;
        }
    }

    private getPidPath(doc) {
        return this.getPath('pid', doc);
    }

    private getModelPath(doc) {
        return this.getPath('model', doc);
    }


    periodicalItemsDetails(solr): PeriodicalItem[] {
        const items: PeriodicalItem[] = [];
        for (const doc of solr['response']['docs']) {
            items.push(this.periodicalItem(doc));
        }
        return items;
    }

    periodicalItems(solr, doctype: string, uuid: string = null): PeriodicalItem[] {
        let hasVirtualIssue = false;
        let virtualIssuePublic: boolean;
        const items: PeriodicalItem[] = [];
        let index = 0;
        for (const doc of solr['response']['docs']) {
            if (doc[this.field('model')] === 'page') {
                hasVirtualIssue = true;
                virtualIssuePublic = doc[this.field('accessibility')] === 'public';
                continue;
            }
            const item = this.periodicalItem(doc);
            if (this.oldSchema()) {
                item.sortIndex = index;
                item.sortNumber = item.calcSortNumber();
                index++;
            }
            items.push(item);
        }
        if (this.oldSchema()) {
            items.sort((a: PeriodicalItem, b: PeriodicalItem) => {
                if (a.date == b.date) {
                    return a.sortNumber - b.sortNumber;
                }
                return a.sortIndex - b.sortIndex;
            });
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


    bookChildItems(solr): any[] {
        const items = [];
        for (const doc of solr['response']['docs']) {
            items.push({
                model: doc[this.field('model')],
                pid: doc[this.field('id')],
                type: doc[this.field('page_type')],
                dnnt: !!doc[this.field('dnnt')],
                number: doc[this.field('page_number')],
                title: doc[this.field('title')],
                policy: doc[this.field('accessibility')]
            });
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
        item.date = doc[this.field('date')];
        item.name = doc[this.field('part_name')];
        item.number = doc[this.field('part_number')];
        item.editionType = doc[this.field('issue_type')];
        return item;
    }

    periodicalItemOld(doc, item: PeriodicalItem) {
        const details = doc['details'];
        if (item.doctype === 'periodicalvolume') {
            if (details && details[0]) {
                const parts = details[0].split('##');
                if (parts.length >= 2) {
                    item.date = parts[0];
                    item.number = parts[1];
                }
            }
        } else if (item.doctype === 'periodicalitem') {
            if (details && details[0]) {
                const parts = details[0].split('##');
                if (parts.length === 4) {
                    item.date = parts[2];
                    item.number = parts[1];
                    if (!item.number) {
                        item.number = parts[3];
                    }
                }
            }
        } else if (item.doctype === 'monographunit') {
            if (details && details[0]) {
                const parts = details[0].split('##');
                if (parts.length === 2) {
                    item.name = parts[1];
                    item.number = parts[0];
                }
            }
        }
        if (!item.date) {
            item.date = doc['datum_str'];
        }
        if (!item.number) {
            item.number = doc['dc.title'];
        }
        if (item.doctype === 'supplement') {
            if (item.number && item.number.indexOf('.')) {
                item.number = item.number.substring(item.number.indexOf('.') + 1);
          } else {
                item.number = '';
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
            const dp = this.getPath('model', doc);
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
            item.description = doc[this.field('collection_description')];
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



    // periodicalFtItems(solr, query: string): PeriodicalFtItem[] {
    //     const items: PeriodicalFtItem[] = [];
    //     for (const doc of solr['response']['docs']) {
    //         const item = new PeriodicalFtItem();
    //         item.uuid = doc['PID'];
    //         item.public = doc['dostupnost'] === 'public';
    //         if (doc['fedora.model'] === 'article') {
    //             item.type = 'article';
    //             item.authors = doc['dc.creator'];
    //             item.title = doc['dc.title'];
    //         } else if (doc['fedora.model'] === 'monographunit') {
    //             item.type = 'monograph_unit';
    //             const pItem = this.periodicalItem(doc);
    //             item.title = pItem.title;
    //             item.part = pItem.subtitle;
    //         } else {
    //             item.type = 'page';
    //             item.page = doc['dc.title'];
    //             item.query = query;
    //         }
    //         if (doc['pid_path'].length > 0 && doc['model_path'].length > 0) {
    //             const pp = doc['pid_path'][0].replace(/\@/, '/');
    //             const pidPath = pp.split('/');
    //             const modelPath = doc['model_path'][0].split('/');
    //             for (let i = 0; i < modelPath.length; i++) {
    //                 const model = modelPath[i];
    //                 item.context[model] = pidPath[i];
    //             }
    //             // if (pidPath.length > 1) {
    //             //     item.issueUuid = pidPath[pidPath.length - 2];
    //             // }
    //             // if (pidPath.length > 2) {
    //             //     item.volumeUuid = pidPath[pidPath.length - 3];
    //             // }
    //             const uuid = item.uuid.replace(/\@/, '/@');
    //             if (solr['highlighting'][uuid]) {
    //                 const ocr = solr['highlighting'][uuid]['text'];
    //                 if (ocr) {
    //                     item.text = ocr[0];
    //                 }
    //             }
    //         }
    //         items.push(item);
    //     }

    //     return items;
    // }

    numberOfFacets(solr): number {
        if (solr['facets']) {
            return solr['facets']['x'];
        }
        return 100;
    }



    private mergeBrowseMonographsAndMonographUnits(items: BrowseItem[]) {
        let monograph;
        let monographunit;
        for (const item of items) {
            if (item.value === 'monograph') {
                monograph = item;
            } else if (item.value === 'monographunit') {
                monographunit = item;
            }
        }
        if (monographunit) {
            if (!monograph) {
                items.push( new BrowseItem('monograph', 'monograph', monographunit.count) );
            } else {
                monograph.count += monographunit.count;
                items.splice(items.indexOf(monographunit), 1);
            }
        }
    }

    getSolrCustomField(field, boost: boolean = false): string {
        if (field === 'author') {
            return this.field('authors_search') + (boost ? '^2' : '');
        } else if (field === 'title') {
            return this.field('titles_search') + (boost ? '^10' : '');
        } else if (field === 'keyword') {
            return this.field('keywords_search');
        } else if (field === 'geoname') {
            return this.field('geonames_search');
        } else if (field === 'signature') {
            return this.field('shelf_locator');
        } else if (field === 'issn') {
            return this.field('issn');
        } else if (field === 'isbn') {
            return this.field('isbn');
        } else if (field === 'fulltext') {
            return this.field('text_ocr') + (boost ? '^0.1' : '');
        } else if (field === 'all') {
            return 'text';
        }
        return '';
    }


}

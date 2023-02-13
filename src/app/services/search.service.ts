import { LocalStorageService } from './local-storage.service';
import { Router } from '@angular/router';
import { KrameriusApiService } from './kramerius-api.service';
import { SolrService } from './solr.service';
import { DocumentItem } from './../model/document_item.model';
import { SearchQuery } from './../search/search_query.model';
import { Injectable } from '@angular/core';
import { CollectionService } from './collection.service';
import { AppSettings } from './app-settings';
import { AnalyticsService } from './analytics.service';
import { Metadata } from '../model/metadata.model';
import { AdminDialogComponent } from '../dialog/admin-dialog/admin-dialog.component';
import { LicenceService } from './licence.service';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AdvancedSearchDialogComponent } from '../dialog/advanced-search-dialog/advanced-search-dialog.component';


@Injectable()
export class SearchService {

    results: DocumentItem[] = [];
    query: SearchQuery;

    keywords: any[] = [];
    doctypes: any[] = [];
    categories: any[] = [];
    accessibility: any[] = [];
    access: any = {};
    authors: any[] = [];
    languages: any[] = [];
    sources: any[] = [];
    licences: any[] = [];
    locations: any[] = [];
    geonames: any[] = [];
    collections: any[] = [];
    publishers: any[] = [];
    places: any[] = [];
    genres: any[] = [];

    loading = false;

    numberOfResults: number;

    activeMobilePanel: String;

    contentType = 'grid'; // 'grid' | 'map'

    collection: Metadata;
    collectionStructure: any;

    adminSelection: boolean;

    constructor(
        private router: Router,
        public licenceService: LicenceService,
        private translate: TranslateService,
        private collectionService: CollectionService,
        private solr: SolrService,
        private analytics: AnalyticsService,
        private localStorageService: LocalStorageService,
        private api: KrameriusApiService,
        private settings: AppSettings,
        private dialog: MatDialog) {
    }

    public init(context, params) {
        this.collection = null;
        this.collectionStructure = {};
        this.results = [];
        this.keywords = [];
        this.doctypes = [];
        this.categories = [];
        this.collections =[];
        this.accessibility = [];
        this.access = {};
        this.authors = [];
        this.languages = [];
        this.sources = [];
        this.licences = [];
        this.locations = [];
        this.geonames = [];
        this.publishers = [];
        this.places = [];
        this.genres = [];
        this.numberOfResults = 0;
        this.activeMobilePanel = 'results';
        this.query = SearchQuery.fromParams(params, context, this.settings);
        if (this.query.isBoundingBoxSet()) {
            this.contentType = 'map';
        } else {
            this.contentType = 'grid';
        }
        this.search();
    }

    public buildPlaceholderText(): string {
        const q = this.query;
        if (!q.anyFilter()) {
            if (q.collection) {
                return String(this.translate.instant('searchbar.main.collection'));
            } else {
                return String(this.translate.instant('searchbar.main.all'));
            }
        }
        if (!q.collection && q.onlyPublicFilterChecked()) {
            return String(this.translate.instant('searchbar.main.public'));
        }
        let filters = [];
        if (q.accessibility !== 'all' && this.settings.filters.indexOf('accessibility') >= 0) {
            filters.push(this.translate.instant('search.accessibility.' + q.accessibility));
        }
        if (this.settings.filters.indexOf('access') >= 0 && q.access !== 'all') {
            filters.push(this.translate.instant('search.access.' + q.access));
        }
        for (const item of q.doctypes) {
            filters.push(this.translate.instant('model.' + item));
        }
        for (const item of q.categories) {
            filters.push(this.translate.instant('category.' + item));
        }
        filters = filters.concat(q.authors);
        if (q.isYearRangeSet()) {
            filters.push(q.from + ' - ' + q.to);
        }
        filters = filters.concat(q.keywords);
        filters = filters.concat(q.geonames);
        filters = filters.concat(q.publishers);
        filters = filters.concat(q.places);
        filters = filters.concat(q.genres);
        filters = filters.concat(q.collections);
        for (const item of q.languages) {
            filters.push(this.translate.instant('language.' + item));
        }
        for (const item of q.sources) {
            filters.push(this.translate.instant('source.' + item));
        }
        for (const item of q.sources) {
            filters.push(this.translate.instant('source.' + item));
        }
        if (q.isCustomFieldSet()) {
            filters.push(q.getCustomValue());
        }
        for (const item of q.locations) {
            filters.push(this.translate.instant('sigla.' + item.toUpperCase()));
        }
        const key = q.collection ? 'collection_with_filters' : 'filters';
        return this.translate.instant('searchbar.main.' + key) + ' ' + filters.join(', ');
    }

    selectContentType(contentType: string) {
        this.contentType = contentType;
        if (this.contentType === 'map') {
            this.query.setBoundingBox(50.7278, 48.707, 12.7476, 18.9549);
        } else {
            this.query.clearBoundingBox();
        }
        this.reload(false);
    }

    public reload(preservePage: boolean) {
        if (!preservePage) {
            this.query.setPage(1);
        }
        const nav = ['/'];
        if (this.settings.multiKramerius) {
            nav.push(this.settings.currentCode);
        }
        if (this.query.collection) {
            nav.push('collection');
            nav.push(this.query.collection);
        } else {
            nav.push('search');
        }
        this.router.navigate(nav,  { queryParams: this.query.toUrlParams() });
    }

    changeLibrary(kramerius) {
        this.analytics.sendEvent('home', 'change-library', kramerius.title);
        const qp = this.query.getChangeLibraryUrlParams();
        this.settings.assignKramerius(kramerius);
        qp['l'] = kramerius.code;
        this.router.navigate(['search'],  { queryParams: qp });
    }

    public toggleFilter(values: string[], value: string) {
        const index = values.indexOf(value);
        if (index >= 0) {
            values.splice(index, 1);
        } else {
            values.push(value);
        }
        this.reload(false);
    }

    public removeFilter(values: string[], value: string) {
        const index = values.indexOf(value);
        if (index >= 0) {
            values.splice(index, 1);
            this.reload(false);
        }
    }

    public buildK3Link(): string {
        if (this.query.getRawQ()) {
            return this.settings.k3 + 'Search.do?text=' + (this.query.getRawQ() || '');
        } else {
            return this.settings.k3 + 'Welcome.do';

        }
    }

    public setBoundingBox(north: number, south: number, west: number, east: number) {
        this.query.setBoundingBox(north, south, west, east);
        this.reload(false);
    }

    public changeOrdering(ordering: string) {
        this.analytics.sendEvent('search', 'ordering', ordering);
        this.query.setOrdering(ordering);
        this.reload(false);
    }

    public changeQueryString(query: string) {
        this.query.query = query;
        if (query) {
            this.query.setOrdering('relevance');
        }
        this.reload(false);
    }

    public removeAccessibilityFilter() {
        this.setAccessibility('all');
    }

    public setAccessibility(accessibility: string) {
        this.localStorageService.setPublicFilter(accessibility === 'public');
        this.query.setAccessibility(accessibility);
        this.reload(false);
    }

    public removeAccessFilter() {
        this.setAccess('all');
    }

    public setAccess(access: string) {
        // this.localStorageService.setPublicFilter(accessibility === 'public');
        this.query.setAccess(access);
        this.reload(false);
    }

    public setYearRange(from: number, to: number) {
        this.query.setYearRange(from, to);
        this.reload(false);
    }

    public onPage(page: number) {
        this.analytics.sendEvent('search', 'paginator', page + '');
        this.setPage(page);
    }

    private setPage(page: number) {
        this.query.setPage(page);
        this.reload(true);
    }

    public nextPage() {
        this.analytics.sendEvent('search', 'paginator', 'next');
        this.query.setPage(this.query.page + 1);
        this.reload(true);
    }

    public previousPage() {
        this.analytics.sendEvent('search', 'paginator', 'previous');
        this.query.setPage(this.query.page - 1);
        this.reload(true);
    }

    public removeAllFilters() {
        this.query.removeAllFilters();
        this.reload(false);
    }

    public removeQueryString() {
        this.query.query = null;
        this.reload(false);
    }

    public removeCustomField() {
        this.query.removeCustomField();
        this.reload(false);
    }

    public getNumberOfResults(): number {
        return this.numberOfResults;
    }

    public getResultIndexFrom(): number {
        if (this.results.length === 0 || this.getNumberOfResults() === 0) {
            return 0;
        }
        return this.query.getStart() + 1;
    }

    public getResultIndexTo(): number {
        return this.query.getStart() + this.results.length;
    }

    private search() {
        this.loading = true;
        this.api.getSearchResults(this.solr.buildSearchQuery(this.query, null)).subscribe(response => {
            this.handleResponse(response);
            this.loading = false;
        });
        if (this.query.collection) {
            this.api.getMetadata(this.query.collection).subscribe((metadata: Metadata) => {
                this.collection = metadata;
            });
            let uuid = this.query.collection;
            this.collectionStructure = {
                collections: [],
                visible: false
            };
            this.buildCollectionStructure(uuid);
        }
    }

    getCollectionContent() {
      if (this.translate.currentLang == 'en' && this.collection.notes.length > 1) {
        return this.collection.notes[1] || '';
      } else if (this.collection.notes.length >= 1) {
        return this.collection.notes[0] || '';
      }
      return '';
    }

    getCollectionTitle() {
        if (this.translate.currentLang == 'en') {
            return this.collection.getCollectionTitle('eng');
        } else {
            return this.collection.getCollectionTitle('cze');
        }
    }

    getCollectionNavTitle(item) {
        if (this.translate.currentLang == 'en' && item.titleEn) {
            return item.titleEn;
        } else {
            return item.title;
        }
    }

    private buildCollectionStructure(uuid: string) {
        this.api.getSearchResults(`q=pid:"${uuid}"&fl=in_collections.direct,titles.search`).subscribe((result) => {
            if (!result['response']['docs'] || result['response']['docs'].length < 1) {
                return;
            }
            const doc = result['response']['docs'][0];
            const names = doc['titles.search'] || [];
            let title = '';
            let titleEn = '';
            if (names.length > 0) {
                title = names[0];
            }
            if (names.length > 1) {
                titleEn = names[1];
            }
            this.collectionStructure.collections.unshift({ uuid: uuid, title: title, titleEn: titleEn, url: this.settings.getPathPrefix() + '/collection/' + uuid });
            const cols = doc['in_collections.direct'] || [];
            if (cols.length > 0) {
                this.buildCollectionStructure(cols[0]);
            } else {
                if (this.collectionStructure.collections.length > 1) {
                    this.collectionStructure.ready = true;
                }
            }
        });


    }

    public highlightDoctype(doctype: string) {
        return this.query.doctypes.length === 0 || this.query.doctypes.indexOf(doctype) >= 0;
    }

    private handleFacetResponse(response, facet) {
        switch (facet) {
            case 'accessibility': {
                this.accessibility = this.solr.facetAccessibilityList(response);
                // if (this.licenceService.anyUserLicence()) {
                //     this.api.getSearchResults(this.solr.buildSearchQuery(this.query, 'accessible')).subscribe(response => {
                //         let count = 0;
                //         if (this.query.getRawQ() || this.query.isCustomFieldSet()) {
                //             count = this.solr.numberOfSearchResults(response);
                //         } else {
                //             count = this.solr.numberOfResults(response);
                //         }
                //         this.accessibility.splice( this.accessibility.length - 1, 0,  { 'value' : 'accessible', 'count': count } );
                //     });
                // }
                break;
            }
            case 'access:open': 
            case 'access:login': 
            case 'access:terminal': 
            case 'access:all': 
            case 'access:accessible': {
                const type = facet.substring(7);
                let count = 0;
                if (this.query.getRawQ() || this.query.isCustomFieldSet()) {
                    count = this.solr.numberOfSearchResults(response);
                } else {
                    count = this.solr.numberOfResults(response);
                }
                this.access[type].count = count;
                break;
            } 
            case 'doctypes': {
                this.doctypes = this.solr.facetDoctypeList(response, this.settings.joinedDoctypes, this.settings.doctypes);
                break;
            }
            case 'licences': {
                const c1 = this.solr.facetList(response, this.solr.field('licences_facet'), this.query[facet], false);
                // licences_contains
                if (!this.settings.k5Compat() || this.settings.containsLicences) {
                    const c2 = this.solr.facetList(response, this.solr.field('licences_contains'), this.query[facet], false);
                    for (const ll of c2) {
                        let found = false;
                        for (const l of c1) {
                            if (l.value == ll.value) {
                                l.count += ll.count;
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            c1.push(ll);
                        }
                    }
                }
                // licences_ancestors
                if (!this.settings.k5Compat()) {
                    const c3 = this.solr.facetList(response, this.solr.field('licences_ancestors'), this.query[facet], false);
                    for (const ll of c3) {
                        let found = false;
                        for (const l of c1) {
                            if (l.value == ll.value) {
                                l.count += ll.count;
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            c1.push(ll);
                        }
                    }
                }
                this[facet] = c1;
                break;
            }
            case 'categories':
            case 'authors':
            case 'keywords':
            case 'languages':
            case 'sources':
            case 'locations':
            case 'geonames':
            case 'genres':
            case 'publishers':
            case 'places': {
                this[facet] = this.solr.facetList(response, this.solr.getFilterField(facet), this.query[facet], true);
                break;
            }
            case 'collections': {
                this.collections = this.solr.facetList(response, this.solr.getFilterField('collections'), this.query['collections'], true);
                if (this.collectionService.ready()) {
                    this.dropEmptyCollections();
                } else {
                    this.api.getCollections().subscribe(
                        results => {
                            this.collectionService.assign(results);
                            this.dropEmptyCollections();
                        }
                    );
                }
                break;
            }

        }
    }

    // handleAcess() {
    //     let accessMap = {
    //         'open': { open: 0, locked: 0 },
    //         'login': { open: 0, locked: 0 },
    //         'terminal': { open: 0, locked: 0 }
    //     };
    //     let aAll = 0;
    //     for (const a of this.accessibility) {
    //         if (a['value'] == 'public') {
    //             accessMap['open']['open'] = a['count'];
    //         } else if (a['value'] == 'private') {
    //             accessMap['terminal']['locked'] = a['count'];
    //         } else if (a['value'] == 'all') {
    //             aAll = a['count'];
    //         }
    //     }
    //     for (const l of this.licences) {
    //         const code = l['value'];
    //         const type = this.licenceService.access(code);
    //         const accessile = this.licenceService.accessible([code]);
    //         // console.log(`${code} - ${type} - ${accessile}`)
    //         // console.log('type', type);
    //         if (accessMap[type]) {
    //             accessMap[type][accessile ? 'open' : 'locked'] += l['count'];
    //         } 
    //     }
    //     this.access = [];
    //     ['open', 'login', 'terminal'].forEach(a => {
    //         const item = accessMap[a];
    //         if (item['open'] > 0) {
    //             this.access.push({ 'value': a, count: item['open'], accessible: true });
    //         }
    //         if (item['locked'] > 0) {
    //             this.access.push({ 'value': a, count: item['locked'], accessible: false });
    //         }
    //     });
    //     this.access.push({ 'value': 'all', count: aAll });
    //     // console.log(' this.acces',  this.access);
    //     // console.log(' accessMap',  accessMap);

    //     if (this.licenceService.anyUserLicence()) {
    //         this.api.getSearchResults(this.solr.buildSearchQuery(this.query, 'accessible')).subscribe(response => {
    //             let count = 0;
    //             if (this.query.getRawQ() || this.query.isCustomFieldSet()) {
    //                 count = this.solr.numberOfSearchResults(response);
    //             } else {
    //                 count = this.solr.numberOfResults(response);
    //             }
    //             // this.accessibility.splice( this.accessibility.length - 1, 0,  { 'value' : 'accessible', 'count': count } );
    //             this.access.splice( this.access.length - 1, 0,  { 'value' : 'accessible', 'count': count, 'accessible': true } );
    //         });
    //     }


    //     // console.log('--ACCESS', this.access);
     
    // }

    public showAdvancedSearchDialog() {
        const data = {
            fieldType: this.query.isCustomFieldSet() ? this.query.getCustomField() : 'all',
            fieldValue: this.query.isCustomFieldSet() ? this.query.getCustomValue() : '',
        };
        this.dialog.open(AdvancedSearchDialogComponent, { data: data, autoFocus: false });
    }


    private dropEmptyCollections() {
        const cols = [];
        for (const col of this.collections) {
            if (this.collectionService.getNameByPid(col.value) !== '-') {
                cols.push(col);
            }
        }
        this.collections = cols;
    }

    private makeFacetRequest(facet: string) {
        this.api.getSearchResults(this.solr.buildSearchQuery(this.query, facet)).subscribe(response => {
            this.handleFacetResponse(response, facet);
        });
    }

    private checkFacet(condition: boolean, response, facet: string) {
        if (this.settings.filters.indexOf(facet) < 0) {
            return;
        }
        if (condition) {
            this.handleFacetResponse(response, facet);
        } else {
            // if (facet == 'licences') {
            //     this.handleFacetResponse(response, facet);
            // }
            this.makeFacetRequest(facet);
        }
    }

    private handleResponse(response) {
        if (this.query.getRawQ() || this.query.isCustomFieldSet()) {
            this.numberOfResults = this.solr.numberOfSearchResults(response);
            this.results = this.solr.searchResultItems(response, this.query);
        } else {
            this.numberOfResults = this.solr.numberOfResults(response);
            this.results = this.solr.documentItems(response);
        }
        this.checkFacet(this.query.accessibility === 'all', response, 'accessibility');
        this.checkFacet(this.query.access === 'all', response, 'access');
        this.checkFacet(this.query.doctypes.length === 0, response, 'doctypes');
        this.checkFacet(this.query.categories.length === 0, response, 'categories');
        this.checkFacet(this.query.authors.length === 0, response, 'authors');
        this.checkFacet(this.query.keywords.length === 0, response, 'keywords');
        this.checkFacet(this.query.languages.length === 0, response, 'languages');
        this.checkFacet(this.query.sources.length === 0, response, 'sources');
        this.checkFacet(this.query.licences.length === 0, response, 'licences');
        this.checkFacet(this.query.locations.length === 0, response, 'locations');
        this.checkFacet(this.query.geonames.length === 0, response, 'geonames');
        this.checkFacet(this.query.publishers.length === 0, response, 'publishers');
        this.checkFacet(this.query.places.length === 0, response, 'places');
        this.checkFacet(this.query.genres.length === 0, response, 'genres');
        this.checkFacet(this.query.collections.length === 0, response, 'collections');

        if (this.settings.filters.indexOf('access') > -1) {
            this.access = {
                'open': { value: 'open', count: 0, accessible: true },
                'login': { value: 'login', count: 0, accessible: false },
                'terminal': { value: 'terminal', count: 0, accessible: false },
                'accessible': { value: 'accessible', count: 0, accessible: true },
                'all': { value: 'all', count: 0, accessible: false }
            }
            this.makeFacetRequest('access:open');
            if (this.anyLoginLicense()) {
                this.makeFacetRequest('access:login');
            }
            // if (this.anyLoginLicense()) {
                this.makeFacetRequest('access:terminal');
            // }
            if (this.anyLoginLicense() || this.anyTerminalLicense()) {
                this.makeFacetRequest('access:accessible');
            }
            this.makeFacetRequest('access:all');
        }
    }


    showAccessFilter(type: string): boolean {
        if (type == 'login' && !this.anyLoginLicense()) {
            return false;
        }
        if (type == 'accessible' && ((!this.anyLoginLicense() && !this.anyTerminalLicense())  || (this.access['open'].count == this.access['accessible'].count))) {
            return false;
        }
        return true;
    }

    anyLoginLicense(): boolean {
        return this.licenceService.licencesByType('login').length > 0;
    }

    anyTerminalLicense(): boolean {
        for (const l of this.licenceService.licencesByType('terminal')) {
            if (l != '_private') {
                return true;
            }
        }
        return false;
    }

    accessArray(): any[] {
        let aArray = [];
        for (const a of ['open', 'login', 'terminal']) {
            if (this.access[a]) {
                aArray.push(this.access[a]);
            }
        }
        let open = 0;
        let accessible = 0;
        if (this.access['open']) {
            open = this.access['open'].count;
        } 
        if (this.access['accessible']) {
            accessible = this.access['accessible'].count;
            if (open != accessible) {
                aArray.push(this.access['accessible']);
            }
        } 
        if (this.access['all']) {
            aArray.push(this.access['all']);
        }
        return aArray;
    }


  toggleAllSelected() {
    let allSelected = true;
    for (const item of this.results) {
        if (!item.selected) {
            allSelected = false;
            break
        }
    }
    for (const item of this.results) {
        item.selected = !allSelected;
    }
  }

  openAdminActions() {
    const uuids = [];
    for (const item of this.results) {
      if (item.selected) {
        uuids.push(item.uuid);
      }
    }
    this.dialog.open(AdminDialogComponent, { data: { uuids: uuids }, autoFocus: false });
  }

  toggleAdminSelection() {
    if (this.results) {
      for (const item of this.results) {
        item.selected = false;
      }
    }
    this.adminSelection = !this.adminSelection;
  }



}

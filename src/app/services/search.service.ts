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
import { MapSeriesService } from './mapseries.service';
import { Observable, Subject, forkJoin } from 'rxjs';
import { FolderService } from './folder.service';
import { Cutting } from '../model/cutting';


@Injectable()
export class SearchService {


    public static LANGUAGE_MAP = { 
        'cs': 'cze',
        'en': 'eng',
        'de': 'ger',
        'sk': 'slo',
        'sl': 'slv'
    };

    results: DocumentItem[] = [];
    allResults: DocumentItem[] = [];
    private allResultsSubject = new Subject<DocumentItem[]>();

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
    contentTypeDisplay = 'grid'; // 'grid' | 'table'

    collection: Metadata;
    collectionStructure: any;
    collectionStructureTree: any;

    collectionCuttings: Cutting[];

    adminSelection: boolean;
    folder: any;
    itemSelected: boolean;

    activeTab: string;
    displayTabs: boolean ;

    constructor(
        private router: Router,
        public licenceService: LicenceService,
        private translate: TranslateService,
        private collectionService: CollectionService,
        private solr: SolrService,
        private mapSeries: MapSeriesService,
        private analytics: AnalyticsService,
        private localStorageService: LocalStorageService,
        private api: KrameriusApiService,
        private settings: AppSettings,
        private dialog: MatDialog,
        private folderService: FolderService) {
    }

    public init(context, params) {
        this.adminSelection = false;
        this.itemSelected = false;
        this.collection = null;
        this.collectionStructure = {};
        this.collectionStructureTree = [];
        this.collectionCuttings = null;
        this.results = [];
        this.allResults = [];
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
        this.displayTabs = false;
        this.query = SearchQuery.fromParams(params, context, this.settings);
        if (this.query.isBoundingBoxSet()) {
            this.contentType = 'map';
        } else {
            this.contentType = 'grid';
        }
        if (this.settings.availableFilter('access')) {
            this.initAccess();
        }
        if (this.query.folder) {
            this.folderService.getFolder(this.query.folder.uuid).subscribe(folder => {
                this.folder = folder;
                this.query.folder['name'] = this.folder.name;
                let uuids = this.folder.items[0].map(uuid => uuid.id);
                this.api.getSearchResults(this.solr.buildFolderItemsPathsQuery(uuids)).subscribe(response => {
                    let items = response['response']['docs'].map(x => x.own_pid_path);
                    this.query.folder['items'] = items;
                    this.search();
                });
            });
        }
         else {
            this.search();
        }
    }

    watchAllResults(): Observable<DocumentItem[]> {
        return this.allResultsSubject.asObservable();
    }

    private initAccess() {
        this.access = {
            'open': { value: 'open', count: 0, accessible: true },
            'login': { value: 'login', count: 0, accessible: false },
            'terminal': { value: 'terminal', count: 0, accessible: false },
            'accessible': { value: 'accessible', count: 0, accessible: true },
            'all': { value: 'all', count: 0, accessible: false }
        }
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
        for (const item of q.licences) {
            filters.push(this.licenceService.label(item));
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

    selectContentType(contentType: string, contentTypeDisplay: string) {
        this.contentType = contentType;
        this.contentTypeDisplay = contentTypeDisplay;
        if (this.contentType === 'map') {
            if (this.collectionStructure.collections && this.collectionStructure.collections.length > 0) {
                if (this.collectionStructure.collections[0][0].uuid.toString() === this.mapSeries.rootCollectionUUID) {
                    const nav = ['mapseries']
                    nav.push(this.query.collection)
                    this.router.navigate(nav)
                }
                return;
            } else {
                this.query.setBoundingBox(54.7278, 42.707, 8.7476, 26.9549);
            }
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
        this.analytics.sendEvent('home', 'change-library', this.settings.getTitleForAnalytics(kramerius));
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
        this.localStorageService.setPublicFilter(access === 'open');
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

    public setRows(rows: number) {
        this.query.setRows(rows);
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
        if ( this.query && this.query.folder && this.query.folder.uuid) {
            this.router.navigate(['/folders', this.query.folder.uuid]);
        } else {
            this.reload(false);
        }
    }

    public removeFolder() {
        this.query.folder = null;
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
        if (this.query.isBoundingBoxSet() && ['all', 'markers'].includes(this.settings.mapSearchType)) {
            this.api.getSearchResults(this.solr.buildSearchQuery(this.query, 'markers')).subscribe(response => {
                if (this.query.getRawQ() || this.query.isCustomFieldSet()) {
                    this.allResults = this.solr.searchResultItems(response, this.query);
                } else {
                    this.allResults = this.solr.documentItems(response);
                }
                this.allResultsSubject.next(this.allResults);
            });
        }
        if (this.query.collection) {
            this.api.getMetadata(this.query.collection).subscribe((metadata: Metadata) => {
                metadata.addToContext('collection', this.query.collection);
                metadata.doctype = 'collection';
                this.collection = metadata;
                this.api.getItem(this.query.collection).subscribe((item: DocumentItem) => {
                    if (item.in_collection) {
                        for (const collection of item.in_collection) {
                            let uuid = collection;
                            let name = '';
                            this.api.getItem(collection).subscribe(col => {
                                name = col.title
                                this.collection.inCollections.push({'uuid': uuid, 'name': name})
                            })
                        }
                    }
                });
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
        const lang = this.translate.currentLang;
        const content = this.collection.getCollectionNotes(SearchService.LANGUAGE_MAP[lang]);
        return content || this.collection.getCollectionNotes('cze');
    }

    getCollectionTitle() {
        const lang = this.translate.currentLang;
        const title = this.collection.getCollectionTitle(SearchService.LANGUAGE_MAP[lang]);
        return title || this.collection.getCollectionTitle('cze');
    }

    getCollectionNavTitle(item) {
        return item.getTitle(this.translate.currentLang);
    }


    private buildCollectionStructure(uuid: string) {
        this.api.getColletionCuttings(uuid).subscribe((cuttings) => {
            console.log('cuttings', cuttings);
            if (cuttings.length > 0) {
                console.log('results', this.results);
                if (this.results.length > 0) {
                    this.displayTabs = true;
                    this.activeTab = 'documents';
                } else {
                    this.activeTab = 'cuttings';
                }
            }
            this.collectionCuttings = [];
            for (const cutting of cuttings) {
                let item = new Cutting();
                item.title = cutting.name;
                item.description = cutting.description;
                item.url = cutting.url.replace('https://kramerius.trinera.cloud', 'http://localhost:4200/t');
                const regex = /uuid\/(uuid:[A-Fa-f0-9-]+)\?bb=([\d,]+)/;
                const match = cutting.url.match(regex);
                if (match) {
                    const uuid = match[1];
                    const bb = match[2];
                    item.thumb = `${this.api.getIiifBaseUrl(uuid)}/${bb}/!400,400/0/default.jpg`;
                    item.uuid = uuid;
                    // console.log(`UUID: ${uuid}, BB: ${bb}`);
                    item.path = this.settings.getPathPrefix() + '/uuid/' + uuid;
                    item.bb = bb;
                }
                // console.log('item', item);
                this.collectionCuttings.push(item);
            }
            // this.numberOfResults += cuttings.length;
            // this.collectionCuttings = cuttings;
        });

        let collections = [];
        this.buildCollectionStructureTree(uuid).subscribe(() => {
            collections = this.collectionStructureTree;
            let startingCol = this.collectionStructureTree.find(x => x.uuid == uuid);   // urcim si pocatecni kolekci stromu
            this.findPaths(startingCol)                                            // najdu rekurzivne vsechny cesty v kolekcich
            this.collectionStructure.ready = true;
        });  
    }

    findPaths(col: any, path = []) {
        if (!col) {
          return;
        }
        const newPath = [col, ...path];
        if (col.in_collections && col.in_collections.length > 0) {
          for (const childUuid of col.in_collections) {
            const childCol = this.collectionStructureTree.find(x => x.uuid == childUuid);
            this.findPaths(childCol, newPath);
          }
        } else {
          this.collectionStructure.collections.push(newPath);
        }
    }

    private buildCollectionStructureTree(uuid: string): Observable<void> {
        return new Observable<void>((subscriber) => {          
          this.api.getSearchResults(`q=pid:"${uuid}"&fl=pid,in_collections.direct,in_collections,title.search,titles.search,title.search_*,model`).subscribe((result) => {
            if (!result['response']['docs'] || result['response']['docs'].length < 1) {
              subscriber.complete();
              return;
            }
            const item: DocumentItem = this.solr.documentItem(result);
            this.collectionStructureTree.unshift(item);
            if (item.in_collection.length > 0) {
              const observables = item.in_collection.map((col) => this.buildCollectionStructureTree(col));
              forkJoin(observables).subscribe(() => {
                subscriber.next();
                subscriber.complete();
              }, (error) => {
                subscriber.error(error);
              });
            } else {
              if (this.collectionStructure.collections.length > 1) {
              }
              subscriber.next();
              subscriber.complete();
            }
          });
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

        if (this.settings.availableFilter('access')) {
            this.initAccess();
            this.makeFacetRequest('access:open');
            if (this.anyLoginLicence()) {
                this.makeFacetRequest('access:login');
            }
            this.makeFacetRequest('access:terminal');
            if (this.licenceService.anyAppliedLoginOrTerminlLicence()) {
                this.makeFacetRequest('access:accessible');
            }
            this.makeFacetRequest('access:all');
        }
    }


    showAccessFilter(type: string): boolean {
        if (type == 'login' && !this.anyLoginLicence()) {
            return false;
        }
        if (type == 'accessible' && !((this.licenceService.anyAppliedLoginOrTerminlLicence() || (this.access['accessible'].count > 0 && this.access['open'].count == this.access['accessible'].count)))) {
            return false;
        }
        return true;
    }

    anyLoginLicence(): boolean {
        return this.licenceService.licencesByType('login').length > 0;
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
    this.itemSelection();
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

  itemSelection() {
    for (const item of this.results) {
      if (item.selected) {
        this.itemSelected = true;
        break;
      } else {
        this.itemSelected = false;
      }
    }
  }



}

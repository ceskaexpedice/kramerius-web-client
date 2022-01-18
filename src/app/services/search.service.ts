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


@Injectable()
export class SearchService {

    results: DocumentItem[] = [];
    query: SearchQuery;

    keywords: any[] = [];
    doctypes: any[] = [];
    accessibility: any[] = [];
    authors: any[] = [];
    languages: any[] = [];
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
        this.collections =[];
        this.accessibility = [];
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
        if (q.accessibility !== 'all') {
            filters.push(this.translate.instant('search.accessibility.' + q.accessibility));
        }
        for (const item of q.doctypes) {
            filters.push(this.translate.instant('model.' + item));
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
        for (const item of q.licences) {
            filters.push(this.licenceService.label(item));
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
            console.log('this.query.collection', this.query.collection);
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
                if (this.settings.auth && this.licenceService.anyUserLicence()) {
                    this.api.getSearchResults(this.solr.buildSearchQuery(this.query, 'accessible')).subscribe(response => {
                        let count = 0;
                        if (this.query.getRawQ() || this.query.isCustomFieldSet()) {
                            count = this.solr.numberOfSearchResults(response);
                        } else {
                            count = this.solr.numberOfResults(response);
                        }
                        this.accessibility.splice( this.accessibility.length - 1, 0,  { 'value' : 'accessible', 'count': count } );
                    });
                }
                break;
            }
            case 'doctypes': {
                this.doctypes = this.solr.facetDoctypeList(response, this.settings.joinedDoctypes, this.settings.doctypes);
                break;
            }
            case 'licences': {
                this[facet] = this.solr.facetList(response, this.solr.getFilterField(facet), this.query[facet], false);
                break;
            }
            case 'authors':
            case 'keywords':
            case 'languages':
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
        this.checkFacet(this.query.doctypes.length === 0, response, 'doctypes');
        this.checkFacet(this.query.authors.length === 0, response, 'authors');
        this.checkFacet(this.query.keywords.length === 0, response, 'keywords');
        this.checkFacet(this.query.languages.length === 0, response, 'languages');
        this.checkFacet(this.query.licences.length === 0, response, 'licences');
        this.checkFacet(this.query.locations.length === 0, response, 'locations');
        this.checkFacet(this.query.geonames.length === 0, response, 'geonames');
        this.checkFacet(this.query.publishers.length === 0, response, 'publishers');
        this.checkFacet(this.query.places.length === 0, response, 'places');
        this.checkFacet(this.query.genres.length === 0, response, 'genres');
        this.checkFacet(this.query.collections.length === 0, response, 'collections');
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

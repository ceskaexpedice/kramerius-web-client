import { Translator } from 'angular-translator';
import { Author } from './../model/metadata.model';
import { Router } from '@angular/router';
import { KrameriusApiService } from './kramerius-api.service';
import { SolrService } from './solr.service';
import { DocumentItem } from './../model/document_item.model';
import { SearchQuery } from './../search/search_query.model';
import { Page } from './../model/page.model';
import { Injectable } from '@angular/core';
import { CollectionService } from './collection.service';


@Injectable()
export class SearchService {

    results: DocumentItem[] = [];
    query: SearchQuery;

    keywords: any[] = [];
    doctypes: any[] = [];
    accessibility: any[] = [];
    authors: any[] = [];
    languages: any[] = [];
    collections: any[] = [];

    loading = false;

    numberOfResults: number;

    activeMobilePanel: String;

    constructor(
        private router: Router,
        private collectionService: CollectionService,
        private solrService: SolrService,
        private krameriusApiService: KrameriusApiService,
        private translator: Translator) {
            translator.languageChanged.subscribe(() => {
                this.translateCollections();
            });
    }


    public init(params) {
        this.results = [];
        this.keywords = [];
        this.doctypes = [];
        this.collections = [];
        this.accessibility = [];
        this.numberOfResults = 0;
        this.activeMobilePanel = 'results';
        this.query = SearchQuery.fromParams(params);
        this.search();
    }


    public reload(preservePage: boolean) {
        if (!preservePage) {
            this.query.setPage(1);
        }
        this.router.navigate(['search'],  { queryParams: this.query.toUrlParams() });
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

    public changeOrdering(ordering: string) {
        this.query.setOrdering(ordering);
        this.reload(false);
    }

    public changeQueryString(query: string) {
        this.query.query = query;
        this.reload(false);
    }

    public setAccessibility(accessibility: string) {
        this.query.setAccessibility(accessibility);
        this.reload(false);
    }

    public setPage(page: number) {
        this.query.setPage(page);
        this.reload(true);
    }

    public nextPage() {
        this.query.setPage(this.query.page + 1);
        this.reload(true);
    }

    public previousPage() {
        this.query.setPage(this.query.page - 1);
        this.reload(true);
    }

    public removeAllFilters() {
        this.query.removeAllFilters();
        this.reload(false);
    }

    public removeAccessibilityFilter() {
        this.query.accessibility = 'all';
        this.reload(false);
    }

    public removeQueryString() {
        this.query.query = null;
        this.reload(false);
    }

    public getNumberOfResults(): number {
        return this.numberOfResults;
    }

    public getResultIndexFrom(): number {
        if (this.results.length === 0 || this.getNumberOfResults() === 0) {
            return 0;
        }
        return Math.min(this.results.length, this.query.getStart() + 1);
    }


    public getResultIndexTo(): number {
        return this.query.getStart() + this.results.length;
    }

    private search() {
        this.loading = true;
        this.krameriusApiService.getSearchResults(this.query).subscribe(response => {
            this.numberOfResults = this.solrService.numberOfResults(response);
            this.results = this.solrService.documentItems(response);
            this.loading = false;
        });
        this.krameriusApiService.getFacetList(this.query, 'keywords').subscribe(response => {
            this.keywords = response;
        });
        this.krameriusApiService.getFacetList(this.query, 'doctypes').subscribe(response => {
            this.doctypes = response;
        });
        this.krameriusApiService.getFacetList(this.query, 'accessibility').subscribe(response => {
            this.accessibility = response;
        });
        this.krameriusApiService.getFacetList(this.query, 'authors').subscribe(response => {
            this.authors = response;
        });
        this.krameriusApiService.getFacetList(this.query, 'languages').subscribe(response => {
            this.languages = response;
        });
        this.krameriusApiService.getFacetList(this.query, 'collections').subscribe(response => {
            this.collections = response;
            if (this.collectionService.ready()) {
                this.translateCollections();
            } else {
                this.krameriusApiService.getCollections().subscribe(
                    results => {
                        this.collectionService.assign(results);
                        this.translateCollections();
                    }
                );
            }
        });
    }


    private translateCollections() {
        for (const col of this.collections) {
            col['name'] = this.collectionService.getName(col.value);
        }
    }


}

import { Translator } from 'angular-translator';
import { KrameriusApiService } from './kramerius-api.service';
import { SolrService } from './solr.service';
import { Router } from '@angular/router';
import { BrowseQuery } from './../browse/browse_query.model';
import { Injectable } from '@angular/core';
import { filter } from 'rxjs/operator/filter';


@Injectable()
export class BrowseService {

    results: any[] = [];
    query: BrowseQuery;

    numberOfResults: number;

    constructor(
        private router: Router,
        private translator: Translator,
        private solrService: SolrService,
        private krameriusApiService: KrameriusApiService) {
            translator.languageChanged.subscribe(() => {
                this.translateResults();
            });
    }


    public init(params) {
        this.results = [];
        this.numberOfResults = 0;
        this.query = BrowseQuery.fromParams(params);
        this.search();
    }


    public reload(preservePage: boolean) {
        if (!preservePage) {
            this.query.setPage(1);
        }
        this.router.navigate(['browse'],  { queryParams: this.query.toUrlParams() });
    }

    public setCategory(category: string) {
        this.query.setCategory(category);
        this.reload(false);
    }

    public changeOrdering(ordering: string) {
        this.query.setOrdering(ordering);
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

    public getNumberOfResults(): number {
        return this.numberOfResults;
    }

    public getResultIndexFrom(): number {
        return this.query.getStart() + 1;
    }

    public getResultIndexTo(): number {
        return Math.min(this.numberOfResults, this.query.getStart() + this.results.length);
    }

    private search() {
        this.krameriusApiService.getBrowseResults(this.query).subscribe(response => {
            this.numberOfResults = this.solrService.numberOfFacets(response);
            this.results = this.solrService.browseFacetList(response, this.query.getSolrField());
            this.translateResults();
        });
    }

    private translateResults() {
        if (!this.results || !this.query) {
            return;
        }
        if (this.query.category === 'languages') {
            this.translator.waitForTranslation().then(() => {
                const filteredResults = [];
                for (const item of this.results) {
                    item['name'] = this.translator.instant('language.' + item['value']);
                    if (!item['name'].startsWith('language.')) {
                        filteredResults.push(item);
                    }
                }
                this.results = filteredResults;
                this.numberOfResults = this.results.length;
                if (this.query.ordering === 'alphabetical') {
                    this.results.sort(function (a, b) {
                        return a.name.localeCompare(b.name);
                    });
                }
            });
        }
        if (this.query.category === 'doctypes') {
            this.translator.waitForTranslation().then(() => {
                for (const item of this.results) {
                    item['name'] = this.translator.instant('model_plural.' + item['value']);
                }
                if (this.query.ordering === 'alphabetical') {
                    this.results.sort(function (a, b) {
                        return a.name.localeCompare(b.name);
                    });
                }
            });
        }
    }



}

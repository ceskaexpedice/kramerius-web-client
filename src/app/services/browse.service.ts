import { KrameriusApiService } from './kramerius-api.service';
import { SolrService } from './solr.service';
import { Router } from '@angular/router';
import { BrowseQuery } from './../browse/browse_query.model';
import { Injectable } from '@angular/core';


@Injectable()
export class BrowseService {

    results: any[] = [];
    query: BrowseQuery;

    numberOfResults: number;

    constructor(
        private router: Router,
        private solrService: SolrService,
        private krameriusApiService: KrameriusApiService) {
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
        console.log('search');
        this.krameriusApiService.getBrowseResults(this.query).subscribe(response => {
            this.numberOfResults = this.solrService.numberOfFacets(response);
            this.results = this.solrService.facetList(response, this.query.getSolrField(), null, false);
            console.log('results', this.results);
        });
    }




}

import { Injectable } from '@angular/core';
import { DocumentItem } from '../model/document_item.model';
import { SearchQuery } from '../search/search_query.model';
import { Router } from '@angular/router';
import { KrameriusApiService } from './kramerius-api.service';
import { SolrService } from './solr.service';

@Injectable()
export class NavigationService {

  position: number;
  query: SearchQuery;
  results: DocumentItem[] = [];
  overall = 0;
  loading = false;

  constructor(private router: Router, 
              private solr: SolrService,
              private api: KrameriusApiService) { }


  init(item: DocumentItem, query: SearchQuery, results: DocumentItem[], overall: number) {
    this.results = results;
    this.query = query;
    this.overall = overall;
    this.position = this.results.findIndex(x => x.uuid === item.uuid);
  }

  hasNav(): boolean {
    return this.results && this.results.length > 0;
  }

  hasNext(): boolean {
    if (this.position < 0 || this.loading) {
      return false;
    }
    if (this.position < this.results.length - 1) {
        return true;
    }
    if (this.query.page * this.query.getRows() < this.overall) {
        return true;
    }
    return false;
  }

  next() {
    if (!this.hasNext()) {
        return;
    }
    if (this.position < this.results.length - 1) {
      this.position += 1;
      const item = this.results[this.position];
      this.router.navigate([item.url], { replaceUrl: true, queryParams: item.params });
      return;
    }
    this.loading = true;
    this.query.setPage(this.query.page + 1);
    this.api.getSearchResults(this.solr.buildSearchQuery(this.query, null)).subscribe(response => {
        if (this.query.getRawQ() || this.query.isCustomFieldSet()) {
            this.results = this.solr.searchResultItems(response, this.query);
        } else {
            this.results = this.solr.documentItems(response);
        }
        if (this.results.length > 0) {
            this.position = 0;
            const item = this.results[this.position];
            this.router.navigate([item.url], { replaceUrl: true, queryParams: item.params });
            this.loading = false;
        }
    });
  }

  hasPrevious(): boolean {
    if (this.position < 0 || this.loading) {
      return false;
    }
    if (this.position > 0) {
        return true;
    }
    if (this.query.page > 1) {
        return true;
    }
    return false;
  }

  previous() {
    if (!this.hasPrevious()) {
        return;
    }
    if (this.position > 0) {
        this.position -= 1;
        const item = this.results[this.position];
        this.router.navigate([item.url], { replaceUrl: true, queryParams: item.params });
        return;
    }
    this.loading = true;
    this.query.setPage(this.query.page - 1);
    this.api.getSearchResults(this.solr.buildSearchQuery(this.query, null)).subscribe(response => {
        if (this.query.getRawQ() || this.query.isCustomFieldSet()) {
            this.results = this.solr.searchResultItems(response, this.query);
        } else {
            this.results = this.solr.documentItems(response);
        }
        if (this.results.length > 0) {
            this.position = this.results.length - 1;
            const item = this.results[this.position];
            this.router.navigate([item.url], { replaceUrl: true, queryParams: item.params });
            this.loading = false;
        }
    });
  }

}

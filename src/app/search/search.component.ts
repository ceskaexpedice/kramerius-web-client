import { SearchService } from './../services/search.service';
import { SearchQuery } from './search_query.model';
import { SolrService } from './../services/solr.service';
import { DocumentItem } from './../model/document_item.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { KrameriusApiService } from '../services/kramerius-api.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  // results: DocumentItem[] = [];
  // keywords: any[] = [];
  // query: SearchQuery;

  // resultsAll: number;

  // constructor(private route: ActivatedRoute,
  //   public router: Router,
  //   public searchService: SearchService,
  //   private solrService: SolrService,
  //   private krameriusApiService: KrameriusApiService) { }

  constructor(
    private route: ActivatedRoute,
    public searchService: SearchService) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchService.init(params);
       // this.query = SearchQuery.fromParams(params);
      // this.makeSearch();
    });
  }


  // makeSearch() {
  //   this.krameriusApiService.getSearchResults(this.query).subscribe(response => {
  //     this.resultsAll = this.solrService.numberOfResults(response);
  //     // console.log('numberOfResults', numFound);
  //     this.results = this.solrService.documentItems(response);
  //   });
  //   this.krameriusApiService.getFacetList(this.query, 'keywords').subscribe(response => {
  //     // const numFound = this.solrService.numberOfResults(response);
  //     // console.log('numberOfResults', numFound);
  //     this.keywords = response;
  //     console.log('response', response);
  //     // this.results = this.solrService.documentItems(response);
  //   });
  // }

  // onFiltersChanged() {
  //   this.router.navigate(['search'],  { queryParams: this.query.toUrlParams() });
  // }







}

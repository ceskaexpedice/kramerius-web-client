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

  results: DocumentItem[] = [];
  query: SearchQuery;

  constructor(private route: ActivatedRoute,
    public router: Router,
    private solrService: SolrService,
    private krameriusApiService: KrameriusApiService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      // const query = params['q'];
      // const accessibility = params['accessibility'];
      this.query = SearchQuery.fromParams(params);
      this.makeSearch();
    });
  }


  makeSearch() {
    this.krameriusApiService.getSearchResults(this.query).subscribe(response => {
      const numFound = this.solrService.numberOfResults(response);
      console.log('numberOfResults', numFound);
      this.results = this.solrService.documentItems(response);
    });
  }


  onSortChanged(sort) {
     this.query.setSort(sort);
    // this.makeSearch();

    // let navigationExtras;
    // navigationExtras = {
    //   preserveFragment: true,
    //   // preserveQueryParams: true,
    //   queryParams: {sort: sort}
    // };
    this.router.navigate(['search'],  { queryParams: this.query.toUrlParams() });
  }
}

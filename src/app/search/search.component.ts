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

  constructor(
    private route: ActivatedRoute,
    public searchService: SearchService) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchService.init(params);
    });
  }


}

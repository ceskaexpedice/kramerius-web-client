import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { KrameriusApiService } from '../services/kramerius-api.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  results: any[] = [];

  constructor(private route: ActivatedRoute,
    private krameriusApiService: KrameriusApiService) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const query = params['q'];
      this.makeSearch(query);
    });
  }


  makeSearch(query: string) {
    this.krameriusApiService.getSearchResults(query).subscribe(response => {
      const numFound = response['response']['numFound'];
      this.results = response['response']['docs'];
    });
  }
}

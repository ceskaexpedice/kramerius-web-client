import { SearchService } from './../../services/search.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-search-count',
  templateUrl: './search-count.component.html'
})
export class SearchCountComponent implements OnInit {

  constructor(public searchService: SearchService) {
  }

  ngOnInit() {
  }

}

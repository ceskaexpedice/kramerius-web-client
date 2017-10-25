import { LibrarySearchService } from './../services/library-search.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {

  @Input() autocomplete;
  @Input() input;
  accessibilityFilter: boolean;

  searchStr: string;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    public service: LibrarySearchService) {
  }

  ngOnInit() {
    this.accessibilityFilter = false;
    this.searchStr = '';
    this.route.queryParams.subscribe(params => {
      const accessibility = params['accessibility'];
      if (accessibility === 'public') {
        this.accessibilityFilter = true;
      }
      const q = params['q'];
      if (q) {
        this.searchStr = q;
      } else {
        this.searchStr = '';
      }
    });
  }

  onSelected(event) {
    if (event) {
      const uuid = event['originalObject']['PID'];
      const title = event['title'];
      this.router.navigate(['/search'], { queryParams: { q: title } });
    }
  }

  cleanQuery() {
    this.searchStr = '';
  }

  onKeyUp(event) {
    if (event.keyCode === 13) {
      this.search();
    }
  }

  search() {
    let q = this.searchStr;
    if (q == null) {
      q = '';
    }
    const params = { q: q };
    if (this.accessibilityFilter) {
      params['accessibility'] = 'public';
    }
    this.router.navigate(['/search'], { queryParams: params });
  }

}

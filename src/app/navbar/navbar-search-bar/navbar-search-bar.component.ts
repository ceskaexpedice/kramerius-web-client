import { LocalStorageService } from './../../services/local-storage.service';
import { SearchService } from './../../services/search.service';
import { AppState } from './../../app.state';
import { LibrarySearchService } from './../../services/library-search.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-navbar-search-bar',
  templateUrl: './navbar-search-bar.component.html'
})
export class NavbarSearchBarComponent implements OnInit {

  @Input() autocomplete;
  @Input() input;

  searchStr: string;

  constructor(
    public router: Router,
    private state: AppState,
    private route: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private searchService: SearchService,
    public service: LibrarySearchService) {
  }

  ngOnInit() {
    this.searchStr = '';
    this.route.queryParams.subscribe(params => {
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
      this.searchStr = title;
      this.search();
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
    if (this.onSearchScreen()) {
      this.searchService.changeQueryString(q);
    } else {
      const params = { q: q };
      if (this.localStorageService.getProperty(LocalStorageService.ACCESSIBILITY_FILTER) !== '0') {
        params['accessibility'] = 'public';
      }
      this.router.navigate(['/search'], { queryParams: params });
    }
  }

  onSearchScreen() {
    return this.state.activePage.startsWith('/search');
  }

}

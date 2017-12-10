import { LocalStorageService } from './../../services/local-storage.service';
import { SearchService } from './../../services/search.service';
import { AppState } from './../../app.state';
import { LibrarySearchService } from './../../services/library-search.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-home-search-bar',
  templateUrl: './home-search-bar.component.html'
})
export class HomeSearchBarComponent implements OnInit {

  @Input() autocomplete;
  @Input() input;
  accessibilityFilter: boolean;

  searchStr: string;

  constructor(
    public router: Router,
    private state: AppState,
    private route: ActivatedRoute,
    private searchService: SearchService,
    private localStorageService: LocalStorageService,
    public service: LibrarySearchService) {
  }

  ngOnInit() {
    this.accessibilityFilter = this.localStorageService.getProperty(LocalStorageService.ACCESSIBILITY_FILTER) !== '0';
    this.searchStr = '';
  }

  onSelected(event) {
    if (event) {
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
    const params = { q: q };
    this.localStorageService.setProperty(LocalStorageService.ACCESSIBILITY_FILTER, this.accessibilityFilter ? '1' : '0');
    if (this.accessibilityFilter) {
      params['accessibility'] = 'public';
    }
    this.router.navigate(['/search'], { queryParams: params });
  }


}

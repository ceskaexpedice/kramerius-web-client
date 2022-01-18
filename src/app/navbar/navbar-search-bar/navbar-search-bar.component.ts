import { LocalStorageService } from './../../services/local-storage.service';
import { SearchService } from './../../services/search.service';
import { LibrarySearchService } from './../../services/library-search.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { AppState } from './../../app.state';
import { AnalyticsService } from '../../services/analytics.service';
import { CompleterCmp } from 'ng2-completer';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar-search-bar',
  templateUrl: './navbar-search-bar.component.html',
  styleUrls: ['./navbar-search-bar.component.scss']
})
export class NavbarSearchBarComponent implements OnInit {

  @Input() autocomplete;
  @Input() input;

  searchStr: string;

  @ViewChild('completer', { static: true }) completer: CompleterCmp;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private state: AppState,
    private translate: TranslateService,
    public analytics: AnalyticsService,
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
    this.completer.fillHighlighted = false;
  }

  onSelected(event) {
    if (event) {
      const uuid = event['originalObject']['PID'];
      const title = event['title'];
      this.searchStr = title;
      this.analytics.sendEvent('search phrase', 'navbar-by-selection', this.searchStr);
      this.search();
    }
  }

  cleanQuery() {
    this.searchStr = '';
  }

  onKeyUp(event) {
    if (event.keyCode === 13) {
      this.analytics.sendEvent('search phrase', 'navbar-by-return', this.searchStr);
      this.search();
    }
  }


  getPlaceholder(): string {
    if (!this.state.atSearchScreen()) {
      if (this.localStorageService.publicFilterChecked()) {
        return String(this.translate.instant('searchbar.main.public'));
      } else {
        return String(this.translate.instant('searchbar.main.all'));
      }
    }
    return this.searchService.buildPlaceholderText();
  }

  search() {
    let q = this.searchStr;
    if (q == null) {
      q = '';
    }
    if (this.state.atSearchScreen()) {
      this.searchService.changeQueryString(q);
    } else {
      const params = { q: q };
      if (this.localStorageService.publicFilterChecked()) {
        params['accessibility'] = 'public';
      }
      this.router.navigate(['/search'], { queryParams: params });
    }
  }

  onMagnifyIconClick() {
    this.analytics.sendEvent('search phrase', 'navbar-by-icon', this.searchStr);
    this.search();
  }

}

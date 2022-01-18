import { AppSettings } from './../../services/app-settings';
import { LocalStorageService } from './../../services/local-storage.service';
import { LibrarySearchService } from './../../services/library-search.service';
import { Router } from '@angular/router';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';
import { CompleterCmp } from 'ng2-completer';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home-search-bar',
  templateUrl: './home-search-bar.component.html',
  styleUrls: ['./home-search-bar.component.scss']
})
export class HomeSearchBarComponent implements OnInit {

  @Input() autocomplete;
  @Input() input;
  accessibilityFilter: boolean;

  searchStr: string;

  @ViewChild('completer', { static: true }) completer: CompleterCmp;

  constructor(
    public router: Router,
    private translate: TranslateService,
    public appSettings: AppSettings,
    public analytics: AnalyticsService,
    private localStorageService: LocalStorageService,
    public service: LibrarySearchService) {
  }

  ngOnInit() {
    this.accessibilityFilter = this.localStorageService.publicFilterChecked();
    this.searchStr = '';
    this.completer.fillHighlighted = false;
  }

  onSelected(event) {
    if (event) {
      const title = event['title'];
      this.searchStr = title;
      this.analytics.sendEvent('search phrase', 'home-by-selection', this.searchStr);
      this.search();
    }
  }

  getPlaceholder(): string {
      if (this.accessibilityFilter) {
        return String(this.translate.instant('searchbar.main.public'));
      } else {
        return String(this.translate.instant('searchbar.main.all'));
      }
  }

  cleanQuery() {
    this.searchStr = '';
  }

  onKeyUp(event) {
    if (event.keyCode === 13) {
      this.analytics.sendEvent('search phrase', 'home-by-return', this.searchStr);
      this.search();
    }
  }

  onMagnifyIconClick() {
    this.analytics.sendEvent('search phrase', 'home-by-icon', this.searchStr);
    this.search();
  }

  onSearchButtonClick() {
    if (this.searchStr) {
      this.analytics.sendEvent('search phrase', 'home-by-button', this.searchStr);
    } else {
      this.analytics.sendEvent('home', 'enter');
    }
    this.search();
  }


  onAccessibilityFilterChanged() {
    if (this.appSettings.availableFilter('accessibility')) {
      this.analytics.sendEvent('home', 'accessibility', this.accessibilityFilter + '');
      this.localStorageService.setPublicFilter(this.accessibilityFilter);
    }
  }


  private search() {
    const params = { };
    let q = this.searchStr;
    if (q != null && q != "") {
      params['q'] = q;
    }
    if (this.appSettings.availableFilter('accessibility')) {
      if (this.accessibilityFilter) {
        params['accessibility'] = 'public';
      }
    }
    this.router.navigate(['/search'], { queryParams: params });
  }


}

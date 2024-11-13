import { AppSettings } from './../../services/app-settings';
import { LocalStorageService } from './../../services/local-storage.service';
import { LibrarySearchService } from './../../services/library-search.service';
import { Router } from '@angular/router';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';
import { CompleterCmp } from 'ng2-completer';
import { TranslateService } from '@ngx-translate/core';
import { SearchHelpDialogComponent } from '../../dialog/search-help-dialog/search-help-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home-search-bar',
  templateUrl: './home-search-bar.component.html',
  styleUrls: ['./home-search-bar.component.scss']
})
export class HomeSearchBarComponent implements OnInit {

  @Input() autocomplete;
  @Input() input;
  accessibilityFilter: boolean;
  preselectedLicencesFilter: boolean;

  searchStr: string;

  @ViewChild('completer', { static: true }) completer: CompleterCmp;

  constructor(
    public router: Router,
    private translate: TranslateService,
    private dialog: MatDialog,
    public appSettings: AppSettings,
    public analytics: AnalyticsService,
    private snackBar: MatSnackBar,
    private localStorageService: LocalStorageService,
    public service: LibrarySearchService) {
  }

  ngOnInit() {
    this.accessibilityFilter = this.localStorageService.publicFilterChecked();
    this.preselectedLicencesFilter = this.localStorageService.preselectedLicencesChecked();
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

  showHelp() {
    this.analytics.sendEvent('search-help', 'from-home');
    this.dialog.open(SearchHelpDialogComponent, { autoFocus: false });
  }

  getPlaceholder(): string {
      if (this.accessibilityFilterEnabled() && this.accessibilityFilter) {
        return String(this.translate.instant('searchbar.main.public'));
      } else if (this.preselectedLicencesFilterEnabled() && this.preselectedLicencesFilter) {
        return String(this.translate.instant('searchbar.main.preselected_licences'));
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
    } else if (this.appSettings.availableFilter('access')) {
      this.analytics.sendEvent('home', 'access', this.accessibilityFilter + '');
      this.localStorageService.setPublicFilter(this.accessibilityFilter);
    }
  }

  onPreselectedLicencesFilterChanged() {
    this.analytics.sendEvent('home', 'preselected-licences', this.preselectedLicencesFilter + '');
    this.localStorageService.setPreselectedLicencesFilter(this.preselectedLicencesFilter);
  }

  accessibilityFilterEnabled() {
    return !this.appSettings.preselectedLicences && (this.appSettings.availableFilter('accessibility') || this.appSettings.availableFilter('access'));
  }

  preselectedLicencesFilterEnabled() {
    return !!this.appSettings.preselectedLicences;
  }

  anyFilter(): boolean {
    return this.preselectedLicencesFilterEnabled() || this.accessibilityFilterEnabled();
  }

  private search() {
    const params = { };
    let q = this.searchStr;
    if (q == '!turnDevModeOn') {
      this.localStorageService.setProperty(LocalStorageService.DEV_MODE, '1');
      this.snackBar.open(<string> this.translate.instant('DEV MODE ON'), '', { duration: 2000, verticalPosition: 'bottom' });
      this.searchStr = "";
      return;
    } else if (q == '!turnDevModeOff') {
      this.localStorageService.setProperty(LocalStorageService.DEV_MODE, '0');
      this.snackBar.open(<string> this.translate.instant('DEV MODE OFF'), '', { duration: 2000, verticalPosition: 'bottom' });
      this.searchStr = "";
      return;
    }
    if (q != null && q != "") {
      params['q'] = q;
    }
    if (this.accessibilityFilterEnabled() && this.accessibilityFilter) {
      if (this.appSettings.availableFilter('accessibility')) {
        params['accessibility'] = 'public';
      } else if (this.appSettings.availableFilter('access')) {
        params['access'] = 'open';
      }
    } else if (this.preselectedLicencesFilterEnabled() && this.preselectedLicencesFilter) {
      params['licences'] = this.appSettings.preselectedLicences.join(',,');
    }
    this.router.navigate(['/search'], { queryParams: params });
  }


}

import { AppSettings } from './../../services/app-settings';
import { LocalStorageService } from './../../services/local-storage.service';
import { Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';
import { TranslateService } from '@ngx-translate/core';
import { SearchHelpDialogComponent } from '../../dialog/search-help-dialog/search-help-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { KrameriusApiService } from '../../services/kramerius-api.service';
import { SpeechRecognitionService } from '../../services/speech-recognition.service';
import { AutocompleterComponent } from '../../common/autocompleter/autocompleter.component';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-home-search-bar',
  templateUrl: './home-search-bar.component.html',
  styleUrls: ['./home-search-bar.component.scss']
})
export class HomeSearchBarComponent implements OnInit {

  @ViewChild('autocompleter', { static: true }) autocompleter: AutocompleterComponent;

  accessibilityFilter: boolean;
  preselectedLicencesFilter: boolean;
  searchStr: string;
  lastSearchTerm: string;
  recording = false;

  autocompleterResults: string[] = [];

  constructor(
    private router: Router,
    private speechService: SpeechRecognitionService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private api: KrameriusApiService,
    private analytics: AnalyticsService,
    private settings: AppSettings,
    private ui: UiService,
    private localStorageService: LocalStorageService,
    ) {
  }

  ngOnInit() {
    this.accessibilityFilter = this.localStorageService.publicFilterChecked();
    this.preselectedLicencesFilter = this.localStorageService.preselectedLicencesChecked();
    this.searchStr = '';
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

  getAutocompleteResults(searchTerm: string): void {
    this.lastSearchTerm = searchTerm;
    // this.autocompleterResults = [];
    let publicOnly = this.localStorageService.publicFilterChecked() && this.settings.availableFilter('accessibility');
    this.api.getSearchAutocomplete2(searchTerm, null, publicOnly).subscribe((results: string[]) => {
        if (searchTerm == this.lastSearchTerm) {
          this.autocompleterResults = results || [];
        } else {
        }
    });
  }

  onSearch(searchTerm: string, from: string): void {
    if (searchTerm) {
      this.searchStr = searchTerm;
      this.analytics.sendEvent('search phrase', `home-by-${from}`, this.searchStr);
      this.search();
    }
  }

  onSearchButtonClick() {
    sessionStorage.setItem('SRscrollPosition', null);
    if (this.searchStr) {
      this.analytics.sendEvent('search phrase', 'home-by-button', this.searchStr);
    } else {
      this.analytics.sendEvent('home', 'enter');
    }
    this.search();
  }

  onAccessibilityFilterChanged() {
    if (this.settings.availableFilter('accessibility')) {
      this.analytics.sendEvent('home', 'accessibility', this.accessibilityFilter + '');
      this.localStorageService.setPublicFilter(this.accessibilityFilter);
    } else if (this.settings.availableFilter('access')) {
      this.analytics.sendEvent('home', 'access', this.accessibilityFilter + '');
      this.localStorageService.setPublicFilter(this.accessibilityFilter);
    }
  }

  onPreselectedLicencesFilterChanged() {
    this.analytics.sendEvent('home', 'preselected-licences', this.preselectedLicencesFilter + '');
    this.localStorageService.setPreselectedLicencesFilter(this.preselectedLicencesFilter);
  }

  accessibilityFilterEnabled() {
    return !this.settings.preselectedLicences && (this.settings.availableFilter('accessibility') || this.settings.availableFilter('access'));
  }

  preselectedLicencesFilterEnabled() {
    return !!this.settings.preselectedLicences;
  }

  anyFilter(): boolean {
    return this.preselectedLicencesFilterEnabled() || this.accessibilityFilterEnabled();
  }

  toggleRecording() {
    this.recording = !this.recording;
    if (this.recording) {
      this.analytics.sendEvent('home', 'voice-search', '_start');
      this.speechService.startRecording()
      .then(() => console.log('Recording started'))
      .catch(error => console.error(error));
    } else {
      this.analytics.sendEvent('home', 'voice-search', '_stop');
      this.speechService.stopRecording()
      .then((audioBlob) => {
        return this.speechService.sendAudioToWhisper(audioBlob);
      })
      .then((text) => {
        // remote . at end of text
        text = text.replace(/\.$/, '');
        this.searchStr = text;
        this.analytics.sendEvent('home', 'voice-search', text);
      })
      .catch(error => console.error(error));
    }
  }


  toggleBrowserRecording() {
    this.analytics.sendEvent('home', 'voice-search', '_start');
    this.speechService.useBrowserRecognition()
    .then((text) => {
      this.searchStr = text;
      this.analytics.sendEvent('home', 'voice-search', text);
      if (this.autocompleter) {
        this.autocompleter.receiveAutofocus();
      }
    })
    .catch((error) => console.error(error));
  }

  micActionIcon() {
    if (this.speechService.speechRecognitionSupported()) {
      return 'mic';
    } 
    return null;
  }


  private search() {
    const params = { };
    let q = this.searchStr;
    if (q == '!turnDevModeOn') {
      this.localStorageService.setProperty(LocalStorageService.DEV_MODE, '1');
      this.ui.showStringSuccess('DEV MODE ON');
      this.searchStr = "";
      return;
    } else if (q == '!turnDevModeOff') {
      this.localStorageService.setProperty(LocalStorageService.DEV_MODE, '0');
      this.ui.showStringSuccess('DEV MODE OFF');
      this.searchStr = "";
      return;
    }
    if (q != null && q != "") {
      params['q'] = q;
    }
    if (this.accessibilityFilterEnabled() && this.accessibilityFilter) {
      if (this.settings.availableFilter('accessibility')) {
        params['accessibility'] = 'public';
      } else if (this.settings.availableFilter('access')) {
        params['access'] = 'open';
      }
    } else if (this.preselectedLicencesFilterEnabled() && this.preselectedLicencesFilter) {
      params['licences'] = this.settings.preselectedLicences.join(',,');
    }
    this.router.navigate(['/search'], { queryParams: params });
  }


}

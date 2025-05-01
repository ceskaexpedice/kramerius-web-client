import { SearchService } from './../../services/search.service';
import { DocumentItem } from './../../model/document_item.model';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { KrameriusApiService } from './../../services/kramerius-api.service';
import { AppSettings } from './../../services/app-settings';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { FolderService } from '../../services/folder.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { AuthService } from '../../services/auth.service';
import { NavigationService } from '../../services/navigation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit, OnDestroy, AfterViewInit {
  
  displayRows: boolean = false;
  @ViewChild('scrollableDiv') scrollableDivRef!: ElementRef;


  constructor(public searchService: SearchService,
              private krameriusApiService: KrameriusApiService,
              private settings: AppSettings,
              private _sanitizer: DomSanitizer,
              private ui: UiService,
              private localStorageService: LocalStorageService,
              private folderService: FolderService,
              private authService: AuthService,
              private navigationService: NavigationService,
              private translate: TranslateService,
              private route: ActivatedRoute,
              private router: Router) {
    
  }

  ngOnInit() {
    this.displayRows = true; //this.localStorageService.getProperty(LocalStorageService.DEV_MODE) === '1';
    if (this.authService.isLoggedIn()) {
      this.folderService.getFolders(null);
    }
  }
  
  getThumb(item: DocumentItem) {
    let url = '';
    if (item.library) {
      const krameriusUrl = this.settings.getUrlByCode(item.library);
      url = this.krameriusApiService.getThumbUrlForKramerius(item.uuid, krameriusUrl);
    } else {
       url = this.krameriusApiService.getThumbUrl(item.uuid);
    }
    return this._sanitizer.bypassSecurityTrustStyle(`url(${url})`);
  }

  onOpen(item: DocumentItem) {
    this.navigationService.init(item, this.searchService.query, this.searchService.results, this.searchService.numberOfResults);
    const scrollTop = this.scrollableDivRef.nativeElement.scrollTop;
    sessionStorage.setItem('SRscrollPosition', scrollTop.toString());
    sessionStorage.setItem('SRurl', location.href);
  }

  onCopied(callback) {
    if (callback && callback['isSuccess']) {
      this.ui.showSuccess('common.copied_to_clipboard');
    }
  }
  getSnapshot() {
    this.router.navigate(['/search'], { queryParams: this.route.snapshot.queryParams });
  }

  ngOnDestroy(): void {
    this.folderService.folders = null;
  }

  ngAfterViewInit(): void {
    const savedPos = sessionStorage.getItem('SRscrollPosition');
    const savedUrl = sessionStorage.getItem('SRurl');
    const currentUrl = location.href;
    if (savedPos && this.scrollableDivRef, savedUrl && savedUrl == currentUrl) {
      this.scrollableDivRef.nativeElement.scrollTop = +savedPos;
    }
    sessionStorage.setItem('SRscrollPosition', null);
  }


  changeTab(tab: string) {
    this.searchService.activeTab = tab;
  }



  
}

import { Component, OnInit, HostListener } from '@angular/core';
import { AppSettings } from '../../services/app-settings';
import { SolrService } from '../../services/solr.service';
import { KrameriusApiService } from '../../services/kramerius-api.service';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SearchService } from '../../services/search.service';


@Component({
  selector: 'app-curator-lists',
  templateUrl: './curator-lists.component.html',
  styleUrls: ['./curator-lists.component.scss']
})
export class CuratorListsComponent implements OnInit {

  niceCards: boolean = false ;
  curatorLists;
  curatorListItems = [];
  expanded: any = {};
  windowWidth: number;
  shownItems: number;
  shownDocumentCards: number;
  curatorKeywords: any[];

  constructor(public settings: AppSettings,
              public solrService: SolrService,
              public krameriusApiService: KrameriusApiService,
              public translate: TranslateService,
              private _sanitizer: DomSanitizer,
              private searchService: SearchService) { 
                this.windowWidth = window.innerWidth;
               }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.windowWidth = window.innerWidth; // Aktualizace šířky okna při změně velikosti
    this.findCountOfItems(window.innerWidth);
    console.log('windowWidth', this.windowWidth, this.shownItems, this.shownDocumentCards);
  }

  ngOnInit(): void {
    this.windowWidth = window.innerWidth;
    this.curatorLists = this.settings.curatorLists;
    this.curatorKeywords = this.settings.curatorKeywords;
    console.log('===curatorKeywords', this.curatorKeywords);
    this.findCountOfItems(this.windowWidth);
    if (this.curatorLists) {
      this.getDocumentItems(this.curatorLists)
    }
    console.log('windowWidth onInit', this.windowWidth, this.shownItems, this.shownDocumentCards, this.expanded);
  }
  
  getDocumentItems(curatorLists: any[]) {
    console.log('===getDocItems curatorLists2', curatorLists);
    for (const list of curatorLists) {
      if (!list.items) {
        let query = this.solrService.buildFolderItemsQuery(list.content)
        this.krameriusApiService.getSearchResults(query).subscribe(results => {
          list.items = this.solrService.documentItems(results);
        });
      }
    }
  }

  getTitle(item : any) {
    return item.getTitle ? item.getTitle(this.translate.currentLang) : item.title;
  }

  thumb(uuid: string) {
    return this._sanitizer.bypassSecurityTrustStyle(`url(${this.krameriusApiService.getThumbUrl(uuid)})`);
  }

  expandCards(title: string) {
    this.expanded[title] = !this.expanded[title];
  }
  isExpanded(title: string): boolean {
    return !!this.expanded[title];
  }

  findCountOfItems(size) {
    if (size <= 900) {
      this.shownDocumentCards = 1;
    } else if (size > 900 && size <= 1410) {
      this.shownDocumentCards = 2;
    } else if (size > 1410 && size <= 1650) {
      this.shownDocumentCards = 3;
    } else if (size > 1650 && size <= 2050) {
      this.shownDocumentCards = 4;
    } else if (size > 2050 && size <= 2450) {
      this.shownDocumentCards = 5;
    } else if (size > 2450) {
      this.shownDocumentCards = 6;
    }

    if (size > 1800) {
      this.shownItems = 7;
    } else if (size > 993 && size <= 1800) {
      this.shownItems = Math.floor(((this.windowWidth*70)/100)/160);
    } else if (size > 601 && size <= 993) {
      this.shownItems =  Math.floor(((this.windowWidth*85)/100)/160);
    } else if (size > 0 && size <= 601) {
      this.shownItems =  Math.floor(((this.windowWidth*90)/100)/160);
    }
  }
  getParams(query: string) {
    query = decodeURIComponent(query); // zabrani dvojitemu kodovani
    const params = {};
    const queryParts = query.split('&');
    for (const part of queryParts) {
      params[part.split('=')[0]] = part.split('=')[1];
    }
    return params;
  }

}

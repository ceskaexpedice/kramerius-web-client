import { KrameriusApiService } from './kramerius-api.service';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { CompleterItem, CompleterData } from 'ng2-completer';
import { LocalStorageService } from './local-storage.service';
import { AppState } from '../app.state';
import { SearchService } from './search.service';
import { AppSettings } from './app-settings';

@Injectable()
export class LibrarySearchService extends Subject<CompleterItem[]> implements CompleterData {

    constructor(
        private krameriusApiService: KrameriusApiService,
        private state: AppState,
        private searchService: SearchService,
        private settings: AppSettings,
        private localStorageService: LocalStorageService) {
        super();
    }
    public search(term: string): void {
        let fq = null;
        if (this.state.atSearchScreen()) {
            fq = this.searchService.query.buildFilterQuery();
        } else if (this.localStorageService.publicFilterChecked()) {
            fq = 'dostupnost:public AND (' + this.settings.topLevelFilter + ')';
        } else {
            fq = this.settings.topLevelFilter;
        }
        this.krameriusApiService.getSearchAutocomplete(term, fq).subscribe(results => {
            const items = [];
            const cache = {};
            for (const item of results) {
                if (cache[item['dc.title']]) {
                    continue;
                }
                let index = item['dc.title'].toLowerCase().indexOf(term.toLowerCase());
                if (index < 0) {
                    index = 1000 + item['dc.title'].length;
                }
                items.push({index: index, item: item});
                cache[item['dc.title']]  = true;
            }
            items.sort(function(a, b) {
                if (a.index < b.index) {
                    return -1;
                }
                if (a.index > b.index) {
                    return 1;
                }
                if (a.index === b.index) {
                    return a.item['dc.title'].length - b.item['dc.title'].length;
                }
            });
            const matches: CompleterItem[] = [];
            for (const item of items) {
                matches.push(this.convertToItem(item.item));
            }
            this.next(matches);
        });
    }

    public cancel() {
        // Handle cancel
    }

    public convertToItem(data: any): CompleterItem | null {
        if (!data) {
            return null;
        }
        // data will be string if an initial value is set
        return {
            title: data['dc.title'],
            // image : this.krameriusApiService.getThumbUrl(data.PID),
            originalObject: data
        } as CompleterItem;
    }
}

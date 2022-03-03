import { KrameriusApiService } from './kramerius-api.service';
import { Injectable } from '@angular/core';
import { CompleterItem, CompleterData } from 'ng2-completer';
import { LocalStorageService } from './local-storage.service';
import { AppState } from '../app.state';
import { SearchService } from './search.service';
import { SolrService } from './solr.service';
import { Subject } from 'rxjs';

@Injectable()
export class LibrarySearchService extends Subject<CompleterItem[]> implements CompleterData {

    constructor(
        private api: KrameriusApiService,
        private state: AppState,
        private searchService: SearchService,
        private solr: SolrService,
        private localStorageService: LocalStorageService) {
        super();
    }

    public search(term: string): void {
        let query = null;
        let publicOnly = this.localStorageService.publicFilterChecked();
        if (this.state.atSearchScreen()) {
            query = this.searchService.query;
        }
        this.api.getSearchAutocomplete(term, query, publicOnly).subscribe((results: CompleterItem[]) => {
            this.next(results);
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
            title: data[this.solr.field('title')],
            // image : this.krameriusApiService.getThumbUrl(data.PID),
            originalObject: data
        } as CompleterItem;
    }
}

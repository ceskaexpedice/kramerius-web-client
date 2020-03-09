import { KrameriusApiService } from './kramerius-api.service';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { CompleterItem, CompleterData } from 'ng2-completer';
import { LocalStorageService } from './local-storage.service';
import { AppState } from '../app.state';
import { SearchService } from './search.service';
import { SolrService } from './solr.service';

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
        let fq = null;
        if (this.state.atSearchScreen()) {
            fq = this.solr.buildFilterQuery(this.searchService.query);
        } else if (this.localStorageService.publicFilterChecked()) {
            fq = `${this.solr.field('accessibility')}:public AND (${this.solr.buildTopLevelFilter()})`;
        } else {
            fq = this.solr.buildTopLevelFilter();
        }
        this.api.getSearchResults(this.solr.buildSearchAutocompleteQuery(term, fq)).subscribe(response => {
            this.next(this.solr.autocompleteResults(response, term));
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

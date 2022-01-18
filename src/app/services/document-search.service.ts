import { BookService } from './book.service';
import { KrameriusApiService } from './kramerius-api.service';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CompleterItem, CompleterData } from 'ng2-completer';
import { SolrService } from './solr.service';

@Injectable()
export class DocumentSearchService extends Subject<CompleterItem[]> implements CompleterData {

    constructor(private api: KrameriusApiService, 
                private bookService: BookService) {
        super();
    }

    public search(term: string): void {
        this.api.getFulltextSearchAutocomplete(term, this.bookService.getUuid()).subscribe((results: CompleterItem[]) => {
            this.next(results);
        });
    }

    public cancel() {
    }

}

import { BookService } from './book.service';
import { KrameriusApiService } from './kramerius-api.service';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { CompleterItem, CompleterData } from 'ng2-completer';

@Injectable()
export class DocumentSearchService extends Subject<CompleterItem[]> implements CompleterData {

    constructor(private krameriusApiService: KrameriusApiService, private bookService: BookService) {
        super();
    }
    public search(term: string): void {
        this.krameriusApiService.getDocumentSearchAutocomplete(term, this.bookService.getUuid()).subscribe(result => {
            const items = [];
            if (result && result['highlighting']) {
                for (const [key, value] of Object.entries(result['highlighting'])) {
                    if (value['text_ocr']) {
                        for (const ocr of value['text_ocr']) {
                            const i1 = ocr.indexOf('>>');
                            const i2 = ocr.indexOf('<<');
                            if (i1 > -1 && i2 > -1) {
                                const text = ocr.substring(i1 + 2, i2).toLowerCase();
                                if (items.indexOf(text) < 0) {
                                    items.push(text);
                                }
                            }
                        }
                    }
                }
            }
            items.sort(function(a, b) {
                if (a < b) {
                    return -1;
                }
                if (a > b) {
                    return 1;
                }
                return 0;
            });
            const matches: CompleterItem[] = [];
            for (const i of items) {
                matches.push({
                    title: i,
                    originalObject: i
                });
            }
            this.next(matches);
        });
    }

    public cancel() {
        // Handle cancel
    }

}

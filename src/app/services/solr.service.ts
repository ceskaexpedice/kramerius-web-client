import { DocumentItem } from './../model/document_item.model';
import { PeriodicalItem } from './../model/periodicalItem.model';
import { Injectable } from '@angular/core';


@Injectable()
export class SolrService {

    periodicalItems(solr): PeriodicalItem[] {
        const items: PeriodicalItem[] = [];
        for (const doc of solr['response']['docs']) {
            const item = new PeriodicalItem();
            item.uuid = doc['PID'];
            item.policy = doc['dostupnost'];
            item.doctype = doc['fedora.model'];
            const details = doc['details'];
            if (item.doctype === 'periodicalvolume') {
                if (details && details[0]) {
                    const parts = details[0].split('##');
                    if (parts.length === 2) {
                        item.title = parts[0];
                        item.subtitle = parts[1];
                    }
                }
            } else if (item.doctype === 'periodicalitem') {
                if (details && details[0]) {
                    const parts = details[0].split('##');
                    if (parts.length === 4) {
                        item.title = parts[2];
                        item.subtitle = parts[1];
                        if (!item.subtitle) {
                            item.subtitle = parts[3];
                        }
                    }
                }
            }
            if (!item.title) {
                item.title = doc['datum_str'];
            }
            if (!item.subtitle) {
                item.subtitle = doc['title'];
            }
            items.push(item);
        }
        return items;
    }

    numberOfResults(solr): number {
        return solr['response']['numFound'];
    }

    documentItems(solr): DocumentItem[] {
        const items: DocumentItem[] = [];
        for (const doc of solr['response']['docs']) {
            const item = new DocumentItem();
            item.title = doc['dc.title'];
            item.uuid = doc['PID'];
            item.public = doc['dostupnost'] === 'public';
            item.doctype = doc['fedora.model'];
            item.date = doc['datum_str'];
            item.authors = doc['dc.creator'];
            item.resolveUrl();
            items.push(item);
        }
        return items;
    }



}

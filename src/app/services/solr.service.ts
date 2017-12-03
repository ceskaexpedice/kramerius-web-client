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

    numberOfFacets(solr): number {
        return solr['facets']['x'];
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


    facetList(solr, field, usedFiltes: any[], skipSelected: boolean) {
        const list = [];
        const facetFields = solr['facet_counts']['facet_fields'][field];
        for (let i = 0; i < facetFields.length; i += 2) {
            const value = facetFields[i];
            if (!value) {
                continue;
            }
            const count = facetFields[i + 1];
            const selected = usedFiltes && usedFiltes.indexOf(value) >= 0;
            if (!selected) {
                list.push({'value' : value, 'count': count, 'selected': false});
            } else if (!skipSelected) {
                list.push({'value' : value, 'count': count, 'selected': true});
            }
        }
        return list;
    }

    facetAccessibilityList(solr) {
        const list = [];
        let allDocs = 0;
        let privateDocs = 0;
        let publicDocs = 0;
        const facetFields = solr['facet_counts']['facet_fields']['dostupnost'];
        for (let i = 0; i < facetFields.length; i += 2) {
            if (facetFields[i] === 'public') {
                publicDocs = facetFields[i + 1];
            } else if (facetFields[i] === 'private') {
                privateDocs = facetFields[i + 1];
            }
            allDocs += facetFields[i + 1];
        }
        list.push({'value' : 'public', 'count': publicDocs});
        list.push({'value' : 'private', 'count': privateDocs});
        list.push({'value' : 'all', 'count': allDocs});
        return list;
    }

    browseFacetList(solr, field) {
        const list = [];
        const facetFields = solr['facet_counts']['facet_fields'][field];
        for (let i = 0; i < facetFields.length; i += 2) {
            const value = facetFields[i];
            const count = facetFields[i + 1];
            const item = {'value' : value, 'count': count, name: value};
            if (field === 'language' || field === 'fedora.model') {
                item['name'] = '';
            }
            list.push(item);
        }
        return list;
    }


}

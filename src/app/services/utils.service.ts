import { DocumentItem } from './../model/document_item.model';
import { Injectable } from '@angular/core';


@Injectable()
export class Utils {

    escapeUuid(uuid: string): string {
        return uuid.replace(':', '\\:');
    }


    parseRecommended(json): DocumentItem[] {
        console.log('data', json);
        const items: DocumentItem[] = [];
        for (const doc of json['data']) {
            const item = new DocumentItem();
            item.title = doc['title'];
            item.uuid = doc['pid'];
            item.public = doc['policy'] === 'public';
            item.doctype = doc['model'];
            item.date = doc['datumstr'];
            item.authors = doc['author'];
            items.push(item);
        }
        return items;
    }

}

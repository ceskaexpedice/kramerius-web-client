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
            items.push(this.parseItem(doc));
        }
        return items;
    }

    parseItem(json): DocumentItem {
        const item = new DocumentItem();
        item.title = json['title'];
        item.uuid = json['pid'];
        item.root_uuid = json['root_pid'];
        item.public = json['policy'] === 'public';
        item.doctype = json['model'];
        item.date = json['datumstr'];
        item.authors = json['author'];

        if (item.doctype === 'periodicalvolume' && json['details']) {
            item.volumeNumber = json['details']['volumeNumber'];
            item.volumeYear = json['details']['year'];
        }

        item.resolveUrl();
        return item;
    }

}

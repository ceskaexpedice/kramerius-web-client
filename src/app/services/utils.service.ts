import { DocumentItem, Context } from './../model/document_item.model';
import { Injectable } from '@angular/core';


@Injectable()
export class Utils {

    static inQuotes(text: string): boolean {
        return text && text.startsWith('"') && text.endsWith('"');
    }

    escapeUuid(uuid: string): string {
        return uuid.replace(':', '\\:');
    }


    parseRecommended(json): DocumentItem[] {
        const items: DocumentItem[] = [];
        for (const doc of json['data']) {
            const item = this.parseItem(doc);
            item.title = doc['root_title'];
            items.push(item);
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
        if (json['context'] && json['context'][0]) {
            for (const context of json['context'][0]) {
                item.context.push(new Context(context['pid'], context['model']));
            }
        }
        if (item.doctype === 'periodicalvolume' && json['details']) {
            item.volumeNumber = json['details']['volumeNumber'];
            item.volumeYear = json['details']['year'];
        }
        if (json['pdf'] && json['pdf']['url']) {
            item.pdf = true;
        }

        item.resolveUrl();
        return item;
    }

}

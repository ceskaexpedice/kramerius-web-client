import { AppSettings } from './app-settings';
import { DocumentItem, Context } from './../model/document_item.model';
import { Injectable } from '@angular/core';
import { PeriodicalItem } from '../model/periodicalItem.model';


@Injectable()
export class Utils {


    constructor(private settings: AppSettings) {}

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
        if (json['donator'] && json['donator'].startsWith('donator:')) {
            item.donators = [json['donator'].substring(8)];
        }
        item.root_uuid = json['root_pid'];
        item.public = json['policy'] === 'public';
        item.doctype = json['model'];
        item.dnnt = json['dnnt'];
        item.date = json['datumstr'];
        item.authors = json['author'];
        if (json['replicatedFrom'] && json['replicatedFrom'].length > 0) {
            item.originUrl = json['replicatedFrom'][0];
        }
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
        item.resolveUrl(this.settings.getPathPrefix());
        return item;
    }

    parseMonographBundleChildren(jsonArray, accessibility: string): PeriodicalItem[] {
        const items: PeriodicalItem[] = [];
        for (const json of jsonArray) {
            if (accessibility === 'all' || accessibility === json['policy']) {
                const item = new PeriodicalItem();
                item.uuid = json['pid'];
                item.public = json['policy'] === 'public';
                item.doctype = json['model'];
                item.uuid = json['pid'];
                if (json['details']) {
                    item.name = json['details']['title'];
                    item.number = json['details']['partNumber'];
                }
                items.push(item);
            }
        }
        return items;
    }


}

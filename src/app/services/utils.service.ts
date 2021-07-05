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

    parseBookChild(jsonArray): any[] {
        const result = [];
        for (const json of jsonArray) {
            const item = {
                model: json['model'],
                pid: json['pid'],
                policy: json['policy'],
                title: json['title'],

            }
            const details = json['details'];
            let type = 'unknown';
            let number = '';
            if (details && details['type']) {
                type = details['type'].toLowerCase();
            }
            if (details && details['pagenumber']) {
                number = details['pagenumber'].trim();
            }
            item['type'] = type;
            item['number'] = number;
            result.push(item);
        }
        return result;
    }



    parseItem(json): DocumentItem {
        const item = new DocumentItem();
        item.title = json['title'];
        item.uuid = json['pid'];
        let donators = json['donator'];
        if (donators) {
            item.donators = [];
            if (!Array.isArray(donators)) {
                donators = [donators];
            }
            for (const d of donators) {
                if (d && d.startsWith('donator:')) {
                    const newDonator = d.substring(8);
                    if (item.donators.indexOf(newDonator) < 0) {
                        item.donators.push(newDonator);
                    }
                }
            }
        }
        item.root_uuid = json['root_pid'];
        item.public = json['policy'] === 'public';
        item.doctype = json['model'];
        item.licences = json['dnnt-labels'] || [];
        item.licence = json['providedByLabel'];
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

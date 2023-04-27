import { AppSettings } from './app-settings';
import { DocumentItem, Context } from './../model/document_item.model';
import { Injectable } from '@angular/core';

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
        if (!this.settings.ignorePolicyFlag) {
            if (item.public) {
                item.licences.push('_public');
            } else {
                item.licences.push('_private');
            }
        }
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

}

import { Metadata, TitleInfo, Author, Publisher } from './../model/metadata.model';
import { Page } from './../model/page.model';
import { Injectable } from '@angular/core';
import { parseString, processors, Builder } from 'xml2js';


@Injectable()
export class ModsParserService {

    parse(mods): Metadata {
        const xml = mods.replace(/xmlns.*=".*"/g, '');
        const data = {tagNameProcessors: [processors.stripPrefix], explicitCharkey: true};
        const ctx = this;
        let metadata: Metadata;
        parseString(xml, data, function (err, result) {
            // TODO: Handle parsing error
            metadata = ctx.createMetadata(result);
        });
        return metadata;
    }

    private createMetadata(mods): Metadata {
        const metadata = new Metadata();
        const root = mods['modsCollection']['mods'][0];
        console.log('json metadata', root);

        this.processTitles(root['titleInfo'], metadata);
        this.processAuthors(root['name'], metadata);
        this.processPublishers(root['originInfo'], metadata);
        console.log('---', metadata);
        return metadata;
    }

    private processTitles(array, metadata: Metadata) {
        if (!array) {
            return;
        }
        for (const item of array) {
            const titleInfo = new TitleInfo();
            if (item.title) {
                titleInfo.title = item.title[0]['_'];
            }
            if (item.subTitle) {
                titleInfo.subTitle = item.subTitle[0]['_'];
            }
            metadata.titles.push(titleInfo);
        }
    }

    private processAuthors(array, metadata: Metadata) {
        if (!array) {
            return;
        }
        for (const item of array) {
            const author = new Author();
            let given;
            let family;
            console.log("item", item);
            if (!item.namePart) {
                continue;
            }
            for (const partName of item.namePart) {
                if (partName['$'] && partName['$']['type']) {
                    const type = partName['$']['type'];
                    if (type === 'given') {
                        given = partName['_'];
                    }
                    if (type === 'family') {
                        family = partName['_'];
                    }
                    if (type === 'date') {
                        author.date = partName['_'];
                    } else {
                        author.name = partName['_'];
                    }
                } else {
                    author.name = partName['_'];
                }
            }
            if (given && family) {
                author.name = family + ', ' + given;
            }
            metadata.authors.push(author);
        }
    }



    private processPublishers(array, metadata: Metadata) {
        if (!array) {
            return;
        }
        for (const item of array) {
            const publisher = new Publisher();
            if (item.publisher) {
                publisher.name = item.publisher[0]['_'];
            }
            if (item.dateIssued) {
                publisher.date = item.dateIssued[0]['_'];
            }
            metadata.publishers.push(publisher);
        }
    }


}

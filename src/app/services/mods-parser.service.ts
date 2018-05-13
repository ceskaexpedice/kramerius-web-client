import { element } from 'protractor';
import { Metadata, TitleInfo, Author, Publisher, Location } from './../model/metadata.model';
import { Page } from './../model/page.model';
import { Injectable } from '@angular/core';
import { parseString, processors, Builder } from 'xml2js';


@Injectable()
export class ModsParserService {

    parse(mods, uuid: string): Metadata {
        // const xml = mods.replace(/xmlns.*=".*"/g, '');
        const data = {tagNameProcessors: [processors.stripPrefix], explicitCharkey: true};
        const ctx = this;
        let metadata: Metadata;
        parseString(mods, data, function (err, result) {
            metadata = ctx.createMetadata(result, uuid);
        });
        return metadata;
    }

    private createMetadata(mods, uuid: string): Metadata {
        const metadata = new Metadata();
        metadata.uuid = uuid;
        const root = mods['modsCollection']['mods'][0];
        this.processTitles(root['titleInfo'], metadata);
        this.processAuthors(root['name'], metadata);
        this.processPublishers(root['originInfo'], metadata);
        this.processLocations(root['location'], metadata);
        this.processSubjects(root['subject'], metadata);
        this.processLanguages(root['language'], metadata);

        this.processSimpleArray(root['note'], metadata.notes, null);
        this.processSimpleArray(root['abstract'], metadata.abstracts, null);
        this.processSimpleArray(root['genre'], metadata.genres, { key: 'authority', value: 'czenas' });
        return metadata;
    }

    private processTitles(array, metadata: Metadata) {
        if (!array) {
            return;
        }
        for (const item of array) {
            const titleInfo = new TitleInfo();
            titleInfo.title = this.getText(item.title);
            titleInfo.subTitle = this.getText(item.subTitle);
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
                    }
                    // else {
                    //     author.name = partName['_'];
                    // }
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
            publisher.name = this.getText(item.publisher);
            let dateFrom = null;
            let dateTo = null;
            let date = null;
            if (item.dateIssued) {
                for (const dateIssued of item.dateIssued) {
                    if (this.hasAttribute(dateIssued, 'point', 'start')) {
                        dateFrom = this.getText(dateIssued);
                    } else if (this.hasAttribute(dateIssued, 'point', 'end')) {
                        dateTo = this.getText(dateIssued);
                    } else {
                        date = this.getText(dateIssued);
                    }
                }
                if (dateFrom && dateTo) {
                    date = dateFrom + '-' + dateTo;
                }
                publisher.date = date;
            }
            if (!publisher.empty()) {
                metadata.publishers.push(publisher);
            }
        }
    }


    private processLocations(array, metadata: Metadata) {
        if (!array) {
            return;
        }
        for (const item of array) {
            const location = new Location();
            location.physicalLocation = this.getText(item.physicalLocation);
            location.shelfLocator = this.getText(item.shelfLocator);
            if (!location.empty()) {
                metadata.locations.push(location);
            }
        }
    }


    private processSubjects(array, metadata: Metadata) {
        if (!array) {
            return;
        }
        for (const item of array) {
            if (item.topic) {
                const text = this.getText(item.topic);
                if (text && metadata.keywords.indexOf(text) < 0) {
                    metadata.keywords.push(text);
                }
            }
            if (item.geographic) {
                const text = this.getText(item.geographic);
                if (text && metadata.geonames.indexOf(text) < 0) {
                    metadata.geonames.push(text);
                }
            }
        }
    }

    private processLanguages(array, metadata: Metadata) {
        if (!array) {
            return;
        }
        for (const item of array) {
            if (item.languageTerm && item.languageTerm[0] && item.languageTerm[0]['$']) {
                const elem = item.languageTerm;
                const params = elem[0]['$'];
                if (params['type'] === 'code' && params['authority'] === 'iso639-2b') {
                    metadata.languages.push(this.getText(elem));
                }
            }
        }
    }

    private processSimpleArray(array, objects, param) {
        if (!array) {
            return;
        }
        for (const item of array) {
            const text = item['_'];
            if (text && objects.indexOf(text) < 0 && (!param || (item['$'] && item['$'][param['key']] ===  param['value']))) {
                objects.push(text);
            }
        }
    }


    private getText(element) {
        if (element) {
            if (Array.isArray(element)) {
                return element[0]['_'];
            } else {
                return element['_'];
            }
        } else {
            return null;
        }
    }


    private hasAttribute(element, attr, value) {
        const params = element['$'];
        if (params && params[attr] === value) {
            return true;
        }
        return false;
    }


}

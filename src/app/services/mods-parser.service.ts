import { Metadata, TitleInfo, Author, Publisher, Location, PhysicalDescription } from './../model/metadata.model';
import { Injectable } from '@angular/core';
import { parseString, processors, Builder } from 'xml2js';

@Injectable()
export class ModsParserService {

    parse(mods, uuid: string, type: string = 'full'): Metadata {
        // const xml = mods.replace(/xmlns.*=".*"/g, '');
        const data = {tagNameProcessors: [processors.stripPrefix], explicitCharkey: true};
        const ctx = this;
        let metadata: Metadata;
        parseString(mods, data, function (err, result) {
            if (type === 'full') {
                metadata = ctx.createMetadata(result, uuid);
            } else {
                metadata = ctx.createPlainMetadata(result, uuid);
            }
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
        this.processParts(root['part'], metadata);
        this.processReview(root, metadata);
        this.processPhysicalDescriptions(root['physicalDescription'], metadata);
        this.processSimpleArray(root['note'], metadata.notes, null);
        this.processSimpleArray(root['tableOfContents'], metadata.contents, null);
        this.processSimpleArray(root['abstract'], metadata.abstracts, null);
        this.processSimpleArray(root['genre'], metadata.genres, { key: 'authority', value: 'czenas' });
        return metadata;
    }

    private createPlainMetadata(mods, uuid: string): Metadata {
        const metadata = new Metadata();
        metadata.uuid = uuid;
        const root = mods['modsCollection']['mods'][0];
        this.processAuthors(root['name'], metadata);
        this.processLocations(root['location'], metadata);
        this.processSubjects(root['subject'], metadata);
        this.processLanguages(root['language'], metadata);
        this.processParts(root['part'], metadata);
        this.processPhysicalDescriptions(root['physicalDescription'], metadata);
        this.processSimpleArray(root['note'], metadata.notes, null);
        this.processSimpleArray(root['tableOfContents'], metadata.contents, null);
        this.processSimpleArray(root['abstract'], metadata.abstracts, null);
        this.processSimpleArray(root['genre'], metadata.genres, { key: 'authority', value: 'czenas' });
        if (root['titleInfo'] && root['titleInfo'].length > 0) {
            const title = this.getText(root['titleInfo'][0]['partName']);
            if (title) {
                const titleInfo = new TitleInfo();
                titleInfo.title = title;
                metadata.titles.push(titleInfo);
            }
        }
        if (metadata.titles.length > 0 ||
            metadata.authors.length > 0 ||
            metadata.locations.length > 0 ||
            metadata.keywords.length > 0 ||
            metadata.languages.length > 0 ||
            metadata.physicalDescriptions.length > 0 ||
            metadata.notes.length > 0 ||
            metadata.contents.length > 0 ||
            metadata.abstracts.length > 0 ||
            metadata.genres.length > 0) {
                return metadata;
        }
        return null;
    }



    private processParts(array, metadata: Metadata) {
        if (!array) {
            return;
        }
        for (const item of array) {
            if (item.extent && item.extent[0]) {
                const extent = item.extent[0];
                const start = this.getText(extent.start);
                const end = this.getText(extent.end);
                const list = this.getText(extent.list);

                if (start && end) {
                    metadata.extent = start + '-' + end;
                } else if (list) {
                    metadata.extent = list;
                }
                return;
            }
        }
    }


    private processTitles(array, metadata: Metadata) {
        if (!array) {
            return;
        }
        for (const item of array) {
            const titleInfo = new TitleInfo();
            titleInfo.nonSort = this.getText(item.nonSort);
            titleInfo.title = this.getText(item.title);
            titleInfo.subTitle = this.getText(item.subTitle);
            titleInfo.partNumber = this.getText(item.partNumber);
            titleInfo.partName = this.getText(item.partName);
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
                } else {
                    author.name = partName['_'];
                }
            }
            if (family) {
                author.name = family;
                if (given) {
                    author.name = author.name + ', ' + given;
                }
            } else if (given) {
                author.name = given;
            }
            if (item.role) {
                for (const role of item.role) {
                    if (role['roleTerm']) {
                        for (const roleTerm of role['roleTerm']) {
                            const r = roleTerm['_'];
                            if (r && this.hasAttribute(roleTerm, 'type', 'code')) {
                                author.roles.push(r);
                            }
                        }
                    }
                }
            }
            metadata.authors.push(author);
        }
    }


    private processReview(mods, metadata: Metadata) {
        let hasReview = false;
        if (!mods['genre']) {
            return;
        }
        for (const genre of mods['genre']) {
            if (this.hasAttribute(genre, 'type', 'review')) {
                hasReview = true;
                break;
            }
        }
        if (!hasReview) {
            return;
        }
        const ris = mods['relatedItem'];
        if (!ris || ris.length === 0) {
            return;
        }
        let review: Metadata;
        for (const ri of ris) {
            review = new Metadata();
            this.processTitles(ri['titleInfo'], review);
            this.processAuthors(ri['name'], review);
            this.processPublishers(ri['originInfo'], review);
            this.processLocations(ri['location'], review);
            this.processSubjects(ri['subject'], review);
            this.processParts(ri['part'], review);
            this.processLanguages(ri['language'], review);
            this.processSimpleArray(ri['note'], review.notes, null);
            this.processSimpleArray(ri['abstract'], review.abstracts, null);
            this.processSimpleArray(ri['genre'], review.genres, { key: 'authority', value: 'czenas' });
            if (ri['$'] && ri['$']['displayLabel'] === 'Recenze na:') {
                metadata.review = review;
                return;
            }
        }
        metadata.review = review;
    }


    private processPublishers(array, metadata: Metadata) {
        if (!array) {
            return;
        }
        for (const item of array) {
            const publisher = new Publisher();
            publisher.name = this.getText(item.publisher);

            // publisher.place = ctx.textInElement($(this), ctx.addNS("placeTerm[type='text'][authority!='marccountry']:first"));
            // var dateOther = ctx.textInElement($(this), ctx.addNS("dateOther:first"));

            if (item.place) {
                for (const place of item.place) {
                    if (!(place.placeTerm && place.placeTerm[0])) {
                        continue;
                    }
                    const placeTerm = place.placeTerm[0];
                    if (this.hasAttribute(placeTerm, 'type', 'text')) {
                        publisher.place = this.getText(placeTerm);
                    }
                }
            }
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
                if (date && (date.endsWith('-9999') || date.endsWith('-uuuu'))) {
                    date = date.substring(0, date.length - 4);
                }
                publisher.date = date;
            }
            if (!publisher.date) {
                publisher.date = this.getText(item.dateOther);
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


    private processPhysicalDescriptions(array, metadata: Metadata) {
        if (!array) {
            return;
        }
        for (const item of array) {
            const desc = new PhysicalDescription();
            desc.extent = this.getText(item.extent);
            desc.note = this.getText(item.note);
            if (!desc.empty()) {
                metadata.physicalDescriptions.push(desc);
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
                    const lang = this.getText(elem);
                    if (lang && lang.length > 0) {
                        metadata.languages.push(lang);
                    }
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
            let el = '';
            if (Array.isArray(element)) {
                el = element[0]['_'];
            } else {
                el = element['_'];
            }
            if (el) {
                return el.trim();
            }
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

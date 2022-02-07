import { Metadata, TitleInfo, Author, Publisher, Location, PhysicalDescription, CartographicData } from './../model/metadata.model';
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
            if (!type || type === 'full') {
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
        this.processIdentifiers(root['identifier'], metadata);
        this.processPublishers(root['originInfo'], metadata);
        this.processLocations(root['location'], metadata);
        this.processSubjects(root['subject'], metadata);
        this.processLanguages(root['language'], metadata);
        this.processRelatedItem(root['relatedItem'], metadata);
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

    private processRelatedItem(array, metadata: Metadata) {
        if (!array) {
            return;
        }
        for (const item of array) {
            this.processParts(item['part'], metadata);
        }
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
            if (item['$'] && item['$']['lang']) {
                titleInfo.lang = item['$']['lang'];
            }
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
        let anyPrimary = false;
        for (const item of array) {
            const author = new Author();
            let given;
            let family;
            let termsOfAddress;
            if (!item.namePart) {
                continue;
            }
            if (item['$'] && item['$']['type']) {
                author.type = item['$']['type'];
            }
            if (item['$'] && item['$']['usage'] === 'primary') {
                anyPrimary = true;
                author.primary = true;
            }
            for (const partName of item.namePart) {
                if (partName['$'] && partName['$']['type']) {
                    const type = partName['$']['type'];
                    if (type === 'given') {
                        given = partName['_'];
                    } else if (type === 'family') {
                        family = partName['_'];
                    } else if (type === 'termsOfAddress') {
                        termsOfAddress = partName['_'];
                    } else if (type === 'date') {
                        author.date = partName['_'];
                    }
                } else {
                    author.name = partName['_'];
                }
            }
            let name = '';
            if (family) {
                name = family;
            }
            if (given) {
                if (name !== '') {
                    name += ', ';
                }
                name += given;
            }
            if (name !== '') {
                author.name = name;
            }
            if (termsOfAddress) {
                if (author.name !== '') {
                    author.name += ' ';
                }
                author.name += termsOfAddress;
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
        if (!anyPrimary) {
            for (const author of metadata.authors) {
                author.primary = true;
            }
        }
    }


    private processIdentifiers(array, metadata: Metadata) {
        if (!array) {
            return;
        }
        for (const item of array) {
            if (item['$'] && item['$']['type']) {
                const type = item['$']['type'];
                const invalid = item['$']['invalid'];
                let value = String(item['_']);
                if (!type || !value || invalid == 'yes') {
                    continue;
                }
                if (type == 'doi' && !value.startsWith('http')) {
                    value = 'https://doi.org/' + value;
                }
                metadata.identifiers[type] = value;
            }
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
            const desc = new PhysicalDescription(this.getText(item.note), this.getText(item.extent));
            if (!desc.empty()) {
                metadata.physicalDescriptions.push(desc);
            }
            if (item.note && Array.isArray(item.note) && item.note.length > 1) {
                for (let i = 1; i < item.note.length; i++) {
                    const note = this.getText(item.note[i]);
                    if (note) {
                        metadata.physicalDescriptions.push(new PhysicalDescription(note));
                    }
                }
            }
        }
    }


    private processSubjects(array, metadata: Metadata) {
        if (!array) {
            return;
        }
        for (const item of array) {
            if (item.topic) {
                for (const topic of item.topic) {
                    const text = this.getText(topic);
                    if (text && metadata.keywords.indexOf(text) < 0) {
                        metadata.keywords.push(text);
                    }
                }
            }
            if (item.geographic) {
                for (const geographic of item.geographic) {
                    const text = this.getText(geographic);
                    if (text && metadata.geonames.indexOf(text) < 0) {
                        metadata.geonames.push(text);
                    }
                }
            }
            if (item.cartographics) {
                const cartographics = item.cartographics;
                const cd = new CartographicData();
                if (Array.isArray(cartographics)) {
                    for (const c of cartographics) {
                        const scale = this.getText(c.scale);
                        const coordinates = this.getText(c.coordinates);
                        if (scale) {
                            cd.scale = scale;
                        }
                        if (coordinates) {
                            cd.coordinates = coordinates;
                        }
                    }
                }
                if (!cd.empty()) {
                    metadata.cartographicData.push(cd);
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
                objects.push(text.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"'));
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

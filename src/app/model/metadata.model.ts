import { Page } from './page.model';
import { Article } from './article.model';
import { DocumentItem } from './document_item.model';
import { PeriodicalItem } from './periodicalItem.model';
import { InternalPart } from './internal_part.model';

export class Metadata {

    public context = {};

    public uuid: string;
    public titles: TitleInfo[] = [];
    public authors: Author[] = [];
    public publishers: Publisher[] = [];
    public extent: String;
    public keywords: string[] = [];
    public geonames: string[] = [];
    public notes: string[] = [];
    public languages: string[] = [];
    public locations: Location[] = [];
    public abstracts: string[] = [];
    public genres: string[] = [];
    public contents: string[] = [];
    public cartographicData: CartographicData[] = [];
    public physicalDescriptions: PhysicalDescription[] = [];
    public identifiers = {};

    public model: string;
    public doctype: string;
    public volume: Volume;

    public isPublic = true;
    public licences: string[] = [];

    public currentIssue: PeriodicalItem;
    public nextIssue: PeriodicalItem;
    public previousIssue: PeriodicalItem;

    public currentVolume: PeriodicalItem;
    public nextVolume: PeriodicalItem;
    public previousVolume: PeriodicalItem;

    public currentUnit: any;
    public nextUnit: any;
    public previousUnit: any;

    public article: Article;
    public internalPart: InternalPart;
    public reviews: Metadata[];
    public volumeMetadata: Metadata;
    public extraParentMetadata: Metadata;

    public mainTitle: string;
    public donators: string[];

    public activePages: string;
    public activePage: Page;
    public activePageRight: Page;

    public originUrl: string;

    public licence: string;

    public inCollections: InCollections[] = [];
    public inCollectionsDirect: InCollections[] = [];
    
    public isPDF = false;

    constructor() {
    }

    public assignDocument(item: DocumentItem) {
        this.isPublic = item.public;
        this.licence = null;
        this.licences = item.licences;
        this.model = item.doctype;
        this.donators = item.donators;
        this.originUrl = item.originUrl;
    }

    public getOriginUrl() {
        if (this.activePage) {
            return this.activePage.originUrl;
        }
        return this.originUrl;
    }

    public addToContext(doctype: string, uuid: string) {
        this.context[doctype] = uuid;
    }

    public getFullContext(doctypes: string[]) {
      let result = [];
      for (const doctype of doctypes) {
        if (this.context[doctype]) {
          result.push({
            type: doctype,
            uuid: this.context[doctype]
          });
        }
      }
      if (this.extraParentMetadata && this.extraParentMetadata.doctype != 'soundunit') {
        result.push({
          type: this.extraParentMetadata.doctype,
          uuid: this.extraParentMetadata.uuid
        });
      }
      if (this.activePage) {
        result.push({
          type: 'page',
          uuid: this.activePage.uuid
        });
      }
      result.reverse();
      return result;
    }

    public getYearRange() {
        if (this.publishers) {
          let min: number;
          let max: number;
          this.publishers.forEach(function(publisher) {
            if (publisher && publisher.date) {
              const d = publisher.date.replace(/ /g, '').split('-');
              if (d.length === 2) {
                if (!(isNaN(Number(d[0])) || isNaN(Number(d[1])) || Number(d[0]) % 1 !== 0 || Number(d[1]) % 1 !== 0)) {
                  const d1 = parseInt(d[0], 10);
                  const d2 = parseInt(d[1], 10);
                  if (!min || d1 < min) {
                    min = d1;
                  }
                  if (!max || d2 > max) {
                    max = d2;
                  }
                }
              }
            }
          });
          const currentYear = new Date().getFullYear();
          if (max && max > currentYear) {
            max = currentYear;
          }
          if (min && max) {
            return [min, max];
          }
        }
    }

    public assignVolume(item: DocumentItem) {
        this.volume = new Volume(item.uuid, item.volumeYear, item.volumeNumber);
    }

    public getTitle(): string {
        if (this.mainTitle) {
            return this.mainTitle;
        }
        if (this.titles.length > 0) {
            this.mainTitle = this.titles[0].mainTitle();
            return this.mainTitle;
        }
        return '';
    }

    public getCollectionTitle(lang: string) {
        for (let t of this.titles) {
            if (t.lang == lang) {
                return t.mainTitle();
            }
        }
    }

    public getCollectionNotes(lang: string) {
        let i = 0;
        for (let t of this.titles) {
            if (t.lang == lang) {
                return this.notes[i] || "";
            }
            i++;
        }
    }


    public getShortTitle(): string {
        return this.getTitle().substring(0, 50);
    }

    public getShortTitleWithUnit(): string {
        let title = this.getShortTitle();
        if (this.currentUnit && this.currentUnit.title) {
            title = this.currentUnit.title + ' | ' + title;
        }
        return title;
    }

    public getShortTitleWithIssue(): string {
        let title = this.getShortTitle();
        if (this.currentIssue && this.currentIssue.date) {
            title += ' ' + this.currentIssue.date;
        }
        return title;
    }

    public getShortTitlwWithVolume(): string {
        let title = this.getShortTitle();
        if (this.volume && this.volume.year) {
            title += ' ' + this.volume.year;
        }
        return title;
    }

    public hasIdentifier(type: string): boolean {
        return !!this.identifiers[type];
    }

    public getPrimaryAuthors() {
        const result = [];
        for (const author of this.authors) {
            if (author.primary) {
                result.push(author);
            }
        }
        return result;
    }

    public getOtherAuthors() {
        const result = [];
        for (const author of this.authors) {
            if (!author.primary) {
                result.push(author);
            }
        }
        return result;
    }

}


export class TitleInfo {
    public lang;
    public nonSort;
    public title;
    public subTitle;
    public partName;
    public partNumber;

    mainTitle(): string {
        if (this.nonSort) {
            return this.nonSort + ' ' + this.title;
        } else {
            return this.title || '';
        }
    }

    fullTitle(): string {
        let t = this.title;
        if (this.nonSort) {
            t = this.nonSort + ' ' + this.title;
        }
        if (this.subTitle) {
            t += ': ' + this.subTitle;
        }
        if (this.partNumber) {
            t += ', ' + this.partNumber;
        }
        if (this.partName) {
            t += ': ' + this.partName;
        }
        return t;
    }
}

export class Volume {
    constructor(public uuid: string, public year: string, public number: string) {
    }
}

export class Author {
    public type: string;
    public usage: string;
    public name: string;
    public date: string;
    public roles: string[];
    public primary = false;

    constructor() {
        this.roles = [];
    }

}

export class Location {
    public shelfLocator;
    public physicalLocation;

    empty() {
        return !(this.shelfLocator || this. physicalLocation);
    }
}

export class PhysicalDescription {
    constructor(public note?: string, public extent?: string) {}
    empty() {
        return !(this.extent || this. note);
    }
}

export class CartographicData {
    public scale: string;
    public coordinates: string;

    empty() {
        return !(this.scale || this.coordinates);
    }
}

export class Publisher {
    public name: string;
    public date: string;
    public place: string;

    placeAndName(): string {
        let s = '';
        if (this.place) {
            s += this.place;
            if (s.endsWith(':')) {
                s = s.substring(0, s.length - 1);
            }
            s = s.trim();
        }
        if (this.name) {
            if (this.place) {
                s += ': ';
            }
            s += this.name;
            if (s.endsWith(',')) {
                s = s.substring(0, s.length - 1);
            }
            s = s.trim();
        }
        return s;
    }

    fullDetail(): string {
       let s = this.placeAndName();
        if (this.date) {
            if (s) {
                s += ', ';
            }
            s += this.date;
        }
        return s;
    }

    empty() {
        return !(this.name || this. date || this.place);
    }
}

export class InCollections {
    public uuid: string;
    public name: string;
}

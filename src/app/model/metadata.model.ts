import { Article } from './article.model';
import { DocumentItem } from './document_item.model';
import { PeriodicalItem } from './periodicalItem.model';

export class Metadata {

    public uuid: string;
    public titles: TitleInfo[] = [];
    public authors: Author[] = [];
    public publishers: Publisher[] = [];
    public keywords: string[] = [];
    public geonames: string[] = [];
    public notes: string[] = [];
    public languages: string[] = [];
    public locations: Location[] = [];
    public abstracts: string[] = [];
    public genres: string[] = [];

    public model: string;
    public doctype: string;
    public volume: Volume;

    public currentIssue: PeriodicalItem;
    public nextIssue: PeriodicalItem;
    public previousIssue: PeriodicalItem;

    public currentUnit: PeriodicalItem;
    public nextUnit: PeriodicalItem;
    public previousUnit: PeriodicalItem;

    public article: Article;

    constructor() {
    }

    public getTitle(): string {
        if (this.titles && this.titles.length > 0) {
            return this.titles[0].title;
        } else {
            return '';
        }
    }

    public getYearRange() {
        if (this.publishers) {
          let min: number;
          let max: number;
          this.publishers.forEach(function(publisher) {
            if (publisher && publisher.date) {
              const d = publisher.date.replace(/ /g, '').split('-');
              if (d.length === 2) {
                if (!(isNaN(d[0]) || isNaN(d[1]) || d[0] % 1 !== 0 || d[1] % 1 !== 0)) {
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
}


export class TitleInfo {
    public title;
    public subTitle;
}

export class Volume {
    constructor(public uuid: string, public year: string, public number: string) {
    }
}

export class Author {
    public name;
    public date;
}

export class Location {
    public shelfLocator;
    public physicalLocation;

    empty() {
        return !(this.shelfLocator || this. physicalLocation);
    }
}


export class Publisher {
    public name;
    public date;
    public place;

    fullDetail() {
        let s = '';
        if (this.place) {
            s += this.place;
        }
        if (this.name) {
            if (this.place) {
                s += ': ';
            }
            s += this.name;
        }
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


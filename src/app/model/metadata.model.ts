export class Metadata {

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

    public doctype: string;
    public volume: Volume = new Volume();


    constructor() {
    }

    public getTitle(): string {
        if (this.titles && this.titles.length > 0) {
            return this.titles[0].title;
        } else {
            return '';
        }
    }
}


export class TitleInfo {
    public title;
    public subTitle;
}

export class Volume {
    public year;
    public number;
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

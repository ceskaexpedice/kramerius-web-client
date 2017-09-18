export class Metadata {

    public titles: TitleInfo[] = [];
    public authors: Author[] = [];
    public publishers: Publisher[] = [];


    constructor() {
    }

}


export class TitleInfo {
    public title;
    public subTitle;
}


export class Author {
    public name;
    public date;
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
}

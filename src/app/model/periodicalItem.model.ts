import { Metadata } from './metadata.model';

export class PeriodicalItem {
    date: string;
    name: string;
    number: string;
    sortNumber: number;
    sortIndex: number;
    doctype: string;
    public: boolean;
    uuid: string;
    thumb: string;
    virtual = false;
    metadata: Metadata;
    dnnt = false;

    constructor() {
    }

    getPath(): string {
        if (this.doctype === 'periodicalvolume') {
            return 'periodical/' + this.uuid;
        } else {
            return 'view/' + this.uuid;
        }
    }

    getTitle(): string {
        const title = this.doctype === 'monographunit' ? this.name : this.date;
        return title || '-';
    }

    getDate(): string {
        return this.date || '-';
    }

    prettyName() {
        let result = this.number;
        let n = this.doctype === 'monographunit' ? this.name : this.date;
        if (this.number && n) {
            return `${this.number} (${n})`;
        }
        if (this.number) {
            return this.number;
        }
        if (n) {
            return n;
        }
        return '';
    }

    getPart(): string {
        if (!this.number) {
            return '';
        }
        return this.number;
    }
    getExtendedPart(): string {
        let result = '';
        if (this.number) {
            result = this.number;
        }
        if (this.name) {
            if (result) {
                result += ': ';
            }
            result += this.name;
        }
        return result;
    }


    calcSortNumber() {
        if (!this.number) {
            return 9999999;
        }
        const m = this.number.match(/^\d+/);
        if (m && m.length > 0) {
            return parseInt(m[0]);
        }
        return 9999999;
    }
}

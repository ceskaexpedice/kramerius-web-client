import { Metadata } from './metadata.model';
import { Translator } from 'angular-translator';

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
    //dnnt = false;
    editionType: string;
    licences: string[];

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

    getExtendedPart(translator: Translator = null): string {
        let result = '';
        const num = this.number || '';
        if (translator) {
            result += (translator.instant('periodical.' + this.doctype, { part: num }) as string);
        } else {
            result += num;
        }
        if (this.name) {
            if (result) {
                result += ': ';
            }
            result += this.name;
        }
        if (translator && ['morning', 'afternoon', 'evening'].indexOf(this.editionType) > -1) {
            result += ' (' + (translator.instant('issue_type.' + this.editionType) as string) + ')';
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

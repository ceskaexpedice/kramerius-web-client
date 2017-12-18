import { Translator } from 'angular-translator';
import { Injectable } from '@angular/core';

@Injectable()
export class CollectionService {

    constructor(private translator: Translator) {

    }

    private collections = null;


    getName(id: string) {
        if (this.collections) {
            for (const coll of this.collections) {
                if (id === coll.pid) {
                    if (coll.descs) {
                        if (this.translator.language === 'cs') {
                            return coll.descs.cs;
                        } else {
                            return coll.descs.en;
                        }
                    }
                }
            }
        }
        return '-';
    }

    assign(collections) {
        this.collections = collections;
    }

    ready(): boolean {
        return !!this.collections;
    }


}

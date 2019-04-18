import { KrameriusApiService } from './kramerius-api.service';
import { Translator } from 'angular-translator';
import { Injectable } from '@angular/core';

@Injectable()
export class KrameriusInfoService {

    constructor(private translator: Translator, private api: KrameriusApiService) {
    }

    clear() {
        this.data = null;
    }

    data() {
        return this.api.getKrameriusInfo(this.translator.language);
    }

}

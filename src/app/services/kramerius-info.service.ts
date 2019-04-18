import { AppSettings } from './app-settings';
import { KrameriusInfo } from './../model/krameriusInfo.model';
import { KrameriusApiService } from './kramerius-api.service';
import { Translator } from 'angular-translator';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable()
export class KrameriusInfoService {


    private dataSubject = new ReplaySubject<KrameriusInfo>(1);
    data$: Observable<KrameriusInfo> = this.dataSubject.asObservable();

    constructor(private translator: Translator, private api: KrameriusApiService, private settings: AppSettings) {
        this.reload();
        this.translator.languageChanged.subscribe(() => {
            this.reload();
        });
        this.settings.kramerius$.subscribe(
            kramerius =>  {
                this.reload();
            }
        );
    }

    reload() {
        this.api.getKrameriusInfo(this.translator.language).subscribe(
            info => this.dataSubject.next(info)
        );
    }

}

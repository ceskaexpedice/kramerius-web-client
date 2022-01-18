import { AppSettings } from './app-settings';
import { KrameriusInfo } from './../model/krameriusInfo.model';
import { KrameriusApiService } from './kramerius-api.service';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class KrameriusInfoService {


    private dataSubject = new ReplaySubject<KrameriusInfo>(1);
    data$: Observable<KrameriusInfo> = this.dataSubject.asObservable();

    constructor(private translate: TranslateService, private api: KrameriusApiService, private settings: AppSettings) {
        this.reload();
        this.translate.onLangChange.subscribe(() => {
            this.reload();
        });
        this.settings.kramerius$.subscribe(
            kramerius =>  {
                this.reload();
            }
        );
    }

    reload() {
        this.api.getKrameriusInfo(this.translate.currentLang).subscribe(
            info => this.dataSubject.next(info)
        );
    }

}

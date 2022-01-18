import { KrameriusApiService } from './kramerius-api.service';
import { Router } from '@angular/router';
import { BrowseQuery } from './../browse/browse_query.model';
import { Injectable } from '@angular/core';
import { CollectionService } from './collection.service';
import { AppSettings } from './app-settings';
import { AnalyticsService } from './analytics.service';
import { BrowseItem } from '../model/browse_item.model';
import { LicenceService } from './licence.service';
import { TranslateService } from '@ngx-translate/core';


@Injectable()
export class BrowseService {

    backupResults: any[] = [];
    results: any[] = [];
    query: BrowseQuery;

    numberOfResults: number;
    loading = false;

    activeMobilePanel: String;

    constructor(
        private router: Router,
        private translate: TranslateService,
        private licences: LicenceService,
        private collectionService: CollectionService,
        private settings: AppSettings,
        private analytics: AnalyticsService,
        private api: KrameriusApiService) {
            translate.onLangChange.subscribe(() => {
                this.translateResults();
            });
    }

    public init(params) {
        this.results = [];
        this.numberOfResults = 0;
        this.activeMobilePanel = 'results';
        this.query = BrowseQuery.fromParams(params, this.getDefaultCategory());
        this.search();
    }


    private getDefaultCategory(): string {
        for (const cat of this.settings.filters) {
            if (cat !== 'accessibility') {
                return cat;
            }
        }
    }

    public reload(preservePage: boolean) {
        if (!preservePage) {
            this.query.setPage(1);
        }
        this.router.navigate(['browse'],  { queryParams: this.query.toUrlParams() });
    }

    public setCategory(category: string) {
        this.query.setText(null);
        this.query.setCategory(category);
        this.reload(false);
    }

    public getCategory(): string {
        return this.query.category;
    }

    public changeOrdering(ordering: string) {
        this.analytics.sendEvent('browse', 'ordering', ordering);
        this.query.setOrdering(ordering);
        this.reload(false);
    }

    public setAccessibility(accessibility: string) {
        this.query.setAccessibility(accessibility);
        this.reload(false);
    }

    public setText(text: string) {
        this.query.setText(text);
        this.reload(false);
    }

    public getText(): string {
        return this.query.text;
    }

    public onPage(page: number) {
        this.analytics.sendEvent('browse', 'paginator', page + '');
        this.setPage(page);
    }

    private setPage(page: number) {
        this.query.setPage(page);
        this.reload(true);
    }

    public nextPage() {
        this.analytics.sendEvent('browse', 'paginator', 'next');
        this.query.setPage(this.query.page + 1);
        this.reload(true);
    }

    public previousPage() {
        this.analytics.sendEvent('browse', 'paginator', 'previous');
        this.query.setPage(this.query.page - 1);
        this.reload(true);
    }

    public getNumberOfResults(): number {
        return this.numberOfResults;
    }

    public getResultIndexFrom(): number {
        if (this.results.length === 0) {
            return 0;
        }
        return this.query.getStart() + 1;
    }

    public getResultIndexTo(): number {
        return Math.min(this.numberOfResults, this.query.getStart() + this.results.length);
    }

    private search() {
        this.loading = true;
        this.api.getBrowseItems(this.query).subscribe( ([items, count]: [BrowseItem[], number]) => {
            this.results = items;
            this.numberOfResults = count;
            this.backupResults = this.results;
            this.translateResults();
        });
    }

    private translateResults() {
        if (!this.results || !this.query) {
            this.loading = false;
            return;
        }
        if (this.getCategory() === 'languages') {
            const filteredResults = [];
            for (const item of this.backupResults) {
                item['name'] = this.translate.instant('language.' + item['value']);
                if (!item['name'].startsWith('language.')) {
                    if (this.getText()) {
                        if (item['name'].toLowerCase().indexOf(this.getText().toLowerCase()) >= 0) {
                            filteredResults.push(item);
                        }
                    } else {
                        filteredResults.push(item);
                    }
                }
            }
            this.results = filteredResults;
            this.numberOfResults = this.results.length;
            this.sortResult();
            this.loading = false;
        } else  if (this.getCategory() === 'licences') {
            const filteredResults = [];
            for (const item of this.backupResults) {
                item['name'] = this.licences.label(item['value']);
                if (item['name']) {
                    if (this.getText()) {
                        if (item['name'].toLowerCase().indexOf(this.getText().toLowerCase()) >= 0) {
                            filteredResults.push(item);
                        }
                    } else {
                        filteredResults.push(item);
                    }
                }
            }
            this.results = filteredResults;
            this.numberOfResults = this.results.length;
            this.sortResult();
            this.loading = false;
        } else if (this.getCategory() === 'doctypes') {
            const filteredResults = [];
            for (const item of this.backupResults) {
                item['name'] = this.translate.instant('model_plural.' + item['value']);
                if (!this.getText() || item['name'].toLowerCase().indexOf(this.getText().toLowerCase()) >= 0) {
                    filteredResults.push(item);
                }
            }
            this.results = filteredResults;
            this.numberOfResults = this.results.length;
            this.sortResult();
            this.loading = false;
        } else if (this.getCategory() === 'locations') {
            const filteredResults = [];
            for (const item of this.backupResults) {
                if (/^[a-z]{3}[0-9]{3}$/.test(item['value'])) {
                    item['value'] = item['value'].toUpperCase();
                }
                item['name'] = this.translate.instant('sigla.' + item['value']);
                if (item['name'].startsWith('sigla.')) {
                    if (this.settings.schemaVersion === '1.0' && !/^[A-Z]{3}[0-9]{3}$/.test(item['value'])) {
                            continue;
                    }
                    item['name'] = item['name'].substring(6);
                }
                if (this.getText()) {
                    if (item['name'].toLowerCase().indexOf(this.getText().toLowerCase()) >= 0) {
                        filteredResults.push(item);
                    }
                } else {
                    filteredResults.push(item);
                }
            }
            this.results = filteredResults;
            this.numberOfResults = this.results.length;
            this.sortResult();
            this.loading = false;
        } else if (this.getCategory() === 'collections') {
            if (this.collectionService.ready()) {
                const filteredResults = [];
                for (const item of this.backupResults) {
                    item.name  = this.collectionService.getNameByPid(item.value);
                    if (item.name === '-') {
                        continue;
                    }
                    if (!this.getText() || item['name'].toLowerCase().indexOf(this.getText().toLowerCase()) >= 0) {
                        filteredResults.push(item);
                    }
                }
                this.results = filteredResults;
                this.numberOfResults = this.results.length;
                this.sortResult();
                this.loading = false;
            } else {
                this.loading = true;
                this.api.getCollections().subscribe(
                    results => {
                        this.collectionService.assign(results);
                        this.translateResults();
                    }
                );
            }
        } else {
            this.loading = false;
        }
    }

    private sortResult() {
        if (this.query.ordering === 'alphabetical') {
            this.results.sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
        }
    }


}

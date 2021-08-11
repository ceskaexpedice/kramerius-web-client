import { AccountService } from './account.service';
import { AppSettings } from './app-settings';
import { DocumentItem } from './../model/document_item.model';
import { Metadata } from './../model/metadata.model';
import { AltoService } from './alto-service';
import { LocalStorageService } from './local-storage.service';
import { NotFoundError } from './../common/errors/not-found-error';
import { UnauthorizedError } from './../common/errors/unauthorized-error';
import { AppError } from './../common/errors/app-error';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { KrameriusApiService } from './kramerius-api.service';
import { Page, PagePosition, PageImageType } from './../model/page.model';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MzModalService } from 'ngx-materialize';
import { DialogOcrComponent } from '../dialog/dialog-ocr/dialog-ocr.component';
import { forkJoin} from 'rxjs/observable/forkJoin';
import { Article } from '../model/article.model';
import { HistoryService } from './history.service';
import { SimpleDialogComponent } from '../dialog/simple-dialog/simple-dialog.component';
import { DomSanitizer} from '@angular/platform-browser';
import { PageTitleService } from './page-title.service';
import { InternalPart } from '../model/internal_part.model';
import { Translator } from 'angular-translator';
import { AnalyticsService } from './analytics.service';
import { DialogPdfGeneratorComponent } from '../dialog/dialog-pdf-generator/dialog-pdf-generator.component';
import { IiifService } from './iiif.service';
import { LoggerService } from './logger.service';
import { PeriodicalItem } from '../model/periodicalItem.model';
 import { LicenceService } from './licence.service';


@Injectable()
export class BookService {

    private fulltextQuery = null;

    private uuid;
    private subject = new Subject<ViewerData>();
    private subjectPages = new Subject<Page[]>();

    private activePageIndex = 0;
    public allPages: Page[] = [];
    public pages: Page[] = [];
    private ftPages: Page[] = [];
    public doublePage = false;
    public doublePageEnabled = false;

    public pageState: BookPageState;
    public bookState: BookState;

    public fulltextAllPages = false;

    public activeMobilePanel: String;

    public metadata: Metadata;

    public pdf: string;
    public pdfPath;
    public isPrivate: boolean;

    public articles: Article[];
    public article: Article;

    public internalParts: InternalPart[];
    public internalPart: InternalPart;

    public lastIndex = -1;

    public activeNavigationTab: string; // pages | articles || internalparts
    public navigationTabsCount: number;
    public showNavigationPanel: boolean;
    public viewer: string; // image | pdf | none

    public licence: string;
    public licences: string[];
    public providedByLabel: string;
    public iiifEnabled = false;

    private supplementUuids = [];

    constructor(private location: Location,
        private altoService: AltoService,
        private settings: AppSettings,
        private pageTitle: PageTitleService,
        private analytics: AnalyticsService,
        private localStorageService: LocalStorageService,
        private api: KrameriusApiService,
        private iiif: IiifService,
        private logger: LoggerService,
        private translator: Translator,
        private sanitizer: DomSanitizer,
        private history: HistoryService,
        private router: Router,
        private licenceService: LicenceService,
        private account: AccountService,
        private modalService: MzModalService) {
    }

    private assignPdfPath(uuid: string) {
        this.viewer = 'pdf';
        this.publishNewPages(BookPageState.Loading);
        this.api.getPdfPreviewBlob(uuid).subscribe(() => {
            // this.bookState = BookState.Success;
            this.publishNewPages(BookPageState.Success);
            if (uuid === null) {
                this.pdf = null;
                this.pdfPath = null;
                return;
            }
            this.pdf = this.api.getPdfUrl(uuid);
            let url = 'assets/pdf/viewer.html?file=' + encodeURIComponent(this.pdf);
            url += '&lang=' + this.translator.language;
            if (this.fulltextQuery) {
                url += '&query=' + this.fulltextQuery;
            }
            this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        },
        (error: AppError)  => {
            this.pdf = null;
            if (error instanceof UnauthorizedError) {
                this.publishNewPages(BookPageState.Inaccessible);
            } else {
                this.publishNewPages(BookPageState.Failure);
            }
            return;
        });
    }

    init(params: BookParams) {
        this.clear();
        this.supplementUuids = [];
        this.uuid = params.uuid;
        this.fulltextQuery = params.fulltext;
        this.bookState = BookState.Loading;
        this.iiifEnabled =  this.settings.iiifEnabled;
        this.api.getItem(params.uuid).subscribe((item: DocumentItem) => {
            if (item.doctype === 'article') {
                if (params.articleUuid) {
                    return;
                }
                const issueUuid = item.getUuidFromContext('periodicalitem');
                if (issueUuid) {
                    this.history.removeCurrent();
                    this.router.navigate(['/view', issueUuid], { replaceUrl: true, queryParams: { article: params.uuid, fulltext: this.fulltextQuery } });
                }
                return;
            } else if (item.doctype === 'internalpart') {
                const parentUuid = item.getParentUuid();
                if (parentUuid) {
                    this.history.removeCurrent();
                    this.router.navigate(['/view', parentUuid], { replaceUrl: true, queryParams: { chapter: params.uuid, fulltext: this.fulltextQuery } });
                }
                return;
            }
            this.isPrivate = !item.public;
            this.api.getMetadata(item.root_uuid).subscribe((metadata: Metadata) => {
                this.metadata = metadata;
                this.metadata.assignDocument(item);
                this.analytics.sendEvent('viewer', 'open', this.metadata.getShortTitle());
                this.pageTitle.setTitle(null, this.metadata.getShortTitle());
                if (item.doctype) {
                    if (item.doctype.startsWith('periodical') || item.doctype === 'supplement') {
                        this.metadata.doctype = 'periodical';
                    } else if (item.doctype === 'monographunit') {
                        this.metadata.doctype = 'monographbundle';
                    } else {
                        this.metadata.doctype = item.doctype;
                    }
                }
                this.metadata.addToContext(this.metadata.doctype, this.metadata.uuid);
                if (item.doctype === 'periodicalitem' || item.doctype === 'supplement') {
                    const volumeUuid = item.getUuidFromContext('periodicalvolume');
                    this.loadVolume(volumeUuid);
                    this.loadIssues(volumeUuid, this.uuid, item.doctype);
                } else if (item.doctype === 'monographunit') {
                    this.loadMonographUnits(item.root_uuid, this.uuid);
                } else if (item.doctype === 'periodicalvolume') {
                    this.loadVolume(this.uuid);
                    this.loadVolumes(item.root_uuid, this.uuid);
                }
                this.localStorageService.addToVisited(item, this.metadata);
                this.licences = item.licences;
                this.licence = item.licence;
                if (item.pdf) {
                    this.licences = item.licences
                    this.showNavigationPanel = false;
                    this.bookState = BookState.Success;
                    this.assignPdfPath(params.uuid);
                } else {
                    this.api.getChildren(params.uuid).subscribe(children => {
                        if (children && children.length > 0) {
                            this.onDataLoaded(children, item.doctype, params.pageUuid, params.articleUuid, params.internalPartUuid);
                        } else {
                            // TODO: Empty document
                            this.onDataLoaded(children, item.doctype, params.pageUuid, params.articleUuid, params.internalPartUuid);
                        }
                    });
                }
            });
        },
        error => {
            if (error instanceof NotFoundError) {
                this.router.navigateByUrl(this.settings.getRouteFor('404'), { skipLocationChange: true });
            }
        });

    }


    getUuid(): string {
        return this.uuid;
    }

    getQuery(): string {
        return this.fulltextQuery;
    }

    private loadVolume(uuid: string) {
        this.api.getItem(uuid).subscribe((item: DocumentItem) => {
            this.metadata.assignVolume(item);
        });
        this.api.getMetadata(uuid, 'volume').subscribe((metadata: Metadata) => {
            this.metadata.addToContext('periodicalvolume', uuid);
            this.metadata.volumeMetadata = metadata;
        });
    }




    private loadIssues(volumeUuid: string, issueUuid: string, doctype: string) {
        this.api.getPeriodicalIssues(volumeUuid, null).subscribe((issues: PeriodicalItem[]) => {
            if (!issues || issues.length < 1) {
                return;
            }
            let index = -1;
            for (let i = 0; i < issues.length; i++) {
                if (issues[i].uuid === issueUuid) {
                    index = i;
                    break;
                }
            }
            if (index < 0) {
                return;
            }
            this.metadata.currentIssue = issues[index];
            this.pageTitle.setTitle(null, this.metadata.getShortTitleWithIssue());
            if (index > 0) {
                this.metadata.previousIssue = issues[index - 1];
            }
            if (index < issues.length - 1) {
                this.metadata.nextIssue = issues[index + 1];
            }
            this.api.getMetadata(issueUuid, 'issue').subscribe((metadata: Metadata) => {
                this.metadata.addToContext(doctype, issueUuid);
                this.metadata.currentIssue.metadata = metadata;
            });
        });
    }


    private loadVolumes(periodicalUuid: string, volumeUuid: string) {
        this.api.getPeriodicalVolumes(periodicalUuid, null).subscribe((volumes: PeriodicalItem[]) => {
            if (!volumes || volumes.length < 1) {
                return;
            }
            let index = -1;
            for (let i = 0; i < volumes.length; i++) {
            if (volumes[i].uuid === volumeUuid) {
                index = i;
                break;
            }
            }
            if (index < 0) {
                return;
            }
            this.metadata.currentVolume = volumes[index];
            this.pageTitle.setTitle(null, this.metadata.getShortTitlwWithVolume());
            if (index > 0) {
                this.metadata.previousVolume = volumes[index - 1];
            }
            if (index < volumes.length - 1) {
                this.metadata.nextVolume = volumes[index + 1];
            }
        });
    }

    private loadMonographUnits(monographUuid: string, unitUud: string) {
        this.api.getMonographUnits(monographUuid, null).subscribe((units: PeriodicalItem[]) => {
            if (!units || units.length < 1) {
                return;
            }
            let index = -1;
            for (let i = 0; i < units.length; i++) {
                if (units[i].uuid === unitUud) {
                    index = i;
                    break;
                }
            }
            if (index < 0) {
                return;
            }
            this.metadata.currentUnit = units[index];
            this.pageTitle.setTitle(null, this.metadata.getShortTitleWithUnit());
            if (index > 0) {
                this.metadata.previousUnit = units[index - 1];
            }
            if (index < units.length - 1) {
                this.metadata.nextUnit = units[index + 1];
            }
            this.api.getMetadata(unitUud).subscribe((metadata: Metadata) => {
                this.metadata.addToContext('monographunit', unitUud);
                this.metadata.currentUnit.metadata = metadata;
            });
        });
    }


    private addSupplementPages(pages: any[], supplements: any[], doctype: string, pageUuid: string, articleUuid: string, internalPartUuid: string) {
        if (supplements.length === 0) {
            this.onDataLoaded(pages, null, pageUuid, articleUuid, internalPartUuid);
            return;
        }
        const supplement = supplements.shift();
        this.api.getChildren(supplement['pid']).subscribe(children => {
            for (const p of children) {
                if (p['model'] === 'page') {
                    p['supplement_uuid'] = supplement['pid'];
                    pages.push(p);
                }
            }
            this.addSupplementPages(pages, supplements, doctype, pageUuid, articleUuid, internalPartUuid);
        });
    }


    private calcNavigationTabsCount() {
        let tabs = 0;
        if (this.allPages.length > 0) {
            tabs += 1;
        }
        if (this.articles.length > 0) {
            tabs += 1;
        }
        if (this.internalParts.length > 0) {
            tabs += 1;
        }
        this.navigationTabsCount = tabs;
    }

    private onDataLoaded(inputPages: any[], doctype: string, pageUuid: string, articleUuid: string, internalPartUuid: string) {
        this.pages = [];
        const pages = [];
        const supplements = [];
        for (const p of inputPages) {
            if (p['model'] === 'supplement') {
                supplements.push(p);
                this.supplementUuids.push(p.pid);
            } else {
                pages.push(p);
            }
        }
        if (supplements.length > 0) {
            this.addSupplementPages(pages, supplements, doctype, pageUuid, articleUuid, internalPartUuid);
            return;
        }
        const pageIndex = this.arrangePages(pages, pageUuid, doctype);
        this.bookState = BookState.Success;
        if (pageIndex === -1 || (this.pages.length === 0 && this.articles.length === 0)) {
            return;
        }
        this.showNavigationPanel = true;
        this.calcNavigationTabsCount();
        if (articleUuid || (!pageUuid && this.pages.length === 0)) {
            this.activeNavigationTab = 'articles';
            let articleForSelection = this.articles[0];
            if (articleUuid) {
                for (const article of this.articles) {
                    if (articleUuid === article.uuid) {
                        articleForSelection = article;
                        break;
                    }
                }
            }
            this.onArticleSelected(articleForSelection);
        } else if (internalPartUuid &&  this.internalParts &&  this.internalParts.length > 0) {
            this.activeNavigationTab = 'internalparts';
            let selection = this.internalParts[0];
            if (internalPartUuid) {
                for (const internalPart of this.internalParts) {
                    if (internalPartUuid === internalPart.uuid) {
                        selection = internalPart;
                        break;
                    }
                }
            }
            this.onInternalPartSelected(selection);
        } else {
            this.activeNavigationTab = 'pages';
            if (this.fulltextQuery) {
                this.fulltextChanged(this.fulltextQuery, pageUuid);
            } else {
                this.goToPageOnIndex(pageIndex, true);
                if (pageIndex === 0) {
                    if (this.account.serviceEnabled()) {
                        this.account.getLastPageIndex(this.uuid, (index: number) => {
                            if (this.activePageIndex === 0 && index && index !== 0) {
                                this.goToPageOnIndex(index);
                            }
                        });
                    }
                }
            }
        }
    }


    private arrangePages(pages: any[], uuid: string, doctype: string): number {
        let index = 0;
        let firstBackSingle = -1;
        let titlePage = -1;
        let lastSingle = -1;
        let currentPage = 0;
        this.activeMobilePanel = 'viewer';
        this.doublePageEnabled = this.localStorageService.getProperty(LocalStorageService.DOUBLE_PAGE) === '1';
        const spines: Page[] = [];
        for (const p of pages) {
            if (p['model'] === 'monographunit') {
                this.history.removeCurrent();
                this.router.navigate(['/periodical', this.uuid], { replaceUrl: true, queryParams: { fulltext: this.fulltextQuery } });
                return -1;
            } else if (p['model'] === 'supplement') {
            } else if (p['model'] === 'article') {
                const article = new Article(p['pid'], p['title'], p['policy']);
                this.articles.push(article);
            } else if (p['model'] === 'internalpart') {
                const internalPart = new InternalPart(p['pid'], p['title'], p['policy']);
                this.internalParts.push(internalPart);
            } else if (p['model'] === 'page') {
                const page = new Page();
                page.uuid = p['pid'];
                page.supplementUuid = p['supplement_uuid'];
                page.public = p['policy'] === 'public';
                page.type = p['type'] ? p['type'].toLowerCase() : '';
                page.number = p['number'];
                if (!page.number) {
                    page.number = p['title'];
                }
                page.setTitle(p['title']);
                page.thumb = this.api.getThumbUrl(page.uuid);
                page.position = PagePosition.Single;
                if (page.type === 'spine') {
                    spines.push(page);
                    continue;
                }
                page.index = index;
                if (uuid === page.uuid) {
                    currentPage = index;
                }
                if ((page.type === 'backcover' || page.supplementUuid) && firstBackSingle === -1) {
                    firstBackSingle = index;
                } else if (page.type === 'titlepage') {
                    titlePage = index;
                } else if (titlePage === -1 && index < pages.length - 2 && (page.type === 'frontcover'
                            || page.type === 'cover'
                            || page.type === 'frontjacket'
                            || page.type === 'jacket'
                            || page.type === 'spine')) {
                    lastSingle = index;
                }
                page.licences = this.licences;
                page.licence = this.licence;
                this.pages.push(page);
                this.allPages.push(page);
                index += 1;
            }
        }
        for (const page of spines) {
            if (firstBackSingle === -1) {
                firstBackSingle = index;
            }
            page.index = index;
            if (uuid === page.uuid) {
                currentPage = index;
            }
            this.pages.push(page);
            this.allPages.push(page);
            index += 1;
        }
        const bounds = this.computeDoublePageBounds(this.pages.length, titlePage, lastSingle, firstBackSingle);
        if (bounds !== null) {
            for (let i = bounds[0]; i < bounds[1]; i += 2) {
                this.pages[i].position = PagePosition.Left;
                this.pages[i + 1].position = PagePosition.Right;
            }
        }
        return currentPage;
    }


    getFulltextQuery(): string {
        return this.fulltextQuery;
    }

    getPage() {
        if (this.pages && this.pages.length > this.activePageIndex) {
            return this.pages[this.activePageIndex];
        }
    }

    getRightPage() {
        if (this.doublePage) {
            return this.pages[this.activePageIndex + 1];
        } else {
            return null;
        }
    }

    watchViewerData(): Observable<ViewerData> {
        return this.subject.asObservable();
    }

    watchPage(): Observable<Page[]> {
        return this.subjectPages.asObservable();
    }

    goToPage(page: Page) {
        this.goToPageOnIndex(page.index);
        if (this.account.serviceEnabled()) {
            this.account.setLastPageIndex(this.uuid, page.index, null);
        }
    }

    goToPageWithUuid(uuid: string) {
        for (const page of this.pages) {
            if (page.uuid === uuid) {
                this.goToPageOnIndex(page.index);
                return;
            }
        }
    }

    goToNext() {
        if (this.hasNext()) {
            const n = this.doublePage ? 2 : 1;
            const index = this.activePageIndex + n;
            this.goToPageOnIndex(index);
            if (this.account.serviceEnabled()) {
                this.account.setLastPageIndex(this.uuid, index, null);
            }
        }
    }

    goToPrevious() {
        if (this.hasPrevious()) {
            const index = this.activePageIndex - 1;
            this.goToPageOnIndex(index);
            if (this.account.serviceEnabled()) {
                this.account.setLastPageIndex(this.uuid, index, null);
            }
        }
    }

    isEmpty(): boolean {
        return this.pages === null || this.pages.length === 0;
    }

    cropEnabled(): boolean {
        const page = this.getPage();
        return page && this.iiifEnabled && page.imageType === PageImageType.TILES;
    }

    hasNext() {
        const n = this.doublePage ? 2 : 1;
        return this.activePageIndex < this.pages.length - n;
    }

    hasPrevious() {
        return this.activePageIndex > 0;
    }

    getPageIndex(): number {
        return this.activePageIndex;
    }


    getPageCount(): number {
        return this.pages ? this.pages.length : 0;
    }


    isActionAvailable(action: string): boolean {
        if (this.licence) {
          const l = this.licenceService.action(this.licence, action);
          if (l == 1) {
            return true;
          } else if (l == 2) {
            return false;
          }
        }
        const value = this.settings.actions[action];
        return value === 'always' || (value === 'public' && !this.isPageInaccessible());
    }

    showOcr() {
        const requests = [];
        requests.push(this.api.getOcr(this.getPage().uuid));
        if (this.getRightPage()) {
            requests.push(this.api.getOcr(this.getRightPage().uuid));
        }
        forkJoin(requests).subscribe(result => {
            const options = {
                ocr: result[0],
                uuid: this.getPage().uuid,
                metadata: this.metadata
            };
            if (result.length > 1) {
                options['ocr2'] = result[1];
            }
            this.modalService.open(DialogOcrComponent, options);
        });
    }


    showTextSelection(extent, width: number, height: number, right: boolean) {
        const uuid = right ? this.getRightPage().uuid : this.getPage().uuid;
        this.api.getAlto(uuid).subscribe(
            result => {
                const text = this.altoService.getTextInBox(result, extent, width, height);
                const options = {
                    ocr: text,
                    uuid: this.getPage().uuid,
                    metadata: this.metadata
                };
                this.modalService.open(DialogOcrComponent, options);
            },
            error => {
                if (error instanceof NotFoundError) {
                    this.modalService.open(SimpleDialogComponent, {
                        title: 'common.warning',
                        message: 'dialogs.missing_alto.message',
                        button: 'common.close'
                    });
                }
            }
        );
    }

    showImageCrop(extent, right: boolean) {
        if (this.pageState === BookPageState.Inaccessible) {
            this.modalService.open(SimpleDialogComponent, {
                title: 'common.warning',
                message: 'dialogs.private_document_jpeg.message',
                button: 'common.close'
            });
        } else if (this.pageState === BookPageState.Success && this.iiifEnabled) {
            const uuid = right ? this.getRightPage().uuid : this.getPage().uuid;
            const url = this.iiif.imageCrop(this.api.getIiifBaseUrl(uuid), extent[0], extent[1], extent[2], extent[3]);
            if (url) {
                window.open(url, '_blank');
            }
        }
    }

    showJpeg() {
        if (this.pageState === BookPageState.Inaccessible) {
            this.modalService.open(SimpleDialogComponent, {
                title: 'common.warning',
                message: 'dialogs.private_document_jpeg.message',
                button: 'common.close'
            });
        } else if (this.pageState === BookPageState.Success) {
            if (this.getRightPage()) {
                  window.open('downloadIMG.html#'+this.getPage().uuid+'#'+this.getRightPage().uuid, '_blank');
            } else {
                  window.open('downloadIMG.html#'+this.getPage().uuid, '_blank');
            }

            /* if (this.iiifEnabled) {
                window.open(this.iiif.getIiifImage(this.api.getIiifBaseUrl(this.getPage().uuid)), '_blank');
                if (this.getRightPage()) {
                    window.open(this.iiif.getIiifImage(this.api.getIiifBaseUrl(this.getRightPage().uuid)), '_blank');
                }
            } else {
                window.open(this.api.getFullJpegUrl(this.getPage().uuid), '_blank');
                if (this.getRightPage()) {
                    window.open(this.api.getFullJpegUrl(this.getRightPage().uuid), '_blank');
                }
            }*/
        }
    }

    generatePdf() {
        this.showPdfDialog('generate');
    }

    prepareToPrint() {
        this.showPdfDialog('prepare');
    }

    cancelFulltext() {
        const currentPage = this.getPage();
        this.refreshPages();
        if (currentPage) {
            this.goToPageWithUuid(currentPage.uuid);
        } else {
            this.goToPageOnIndex(0);
        }
    }

    refreshPages() {
        let index = 0;
        this.pages = [];
        for (const page of this.allPages) {
            page.selected = false;
            page.display = 0;
            page.index = index;
            index += 1;
            this.pages.push(page);
        }
    }

    fulltextAllPagesChanged(pageUuid: string = null) {
        const currentPage = this.getPage();
        let uuid;
        if (pageUuid) {
            uuid = pageUuid;
        } else if (currentPage) {
            uuid = currentPage.uuid;
        }
        if (this.fulltextAllPages) {
            this.pages = this.allPages;
        } else {
            this.pages = this.ftPages;
        }
        if (this.pages.length < 1) {
            this.location.go(this.settings.getPathPrefix() + '/view/' + this.uuid, 'fulltext=' + this.fulltextQuery);
            this.publishNewPages(BookPageState.NoResults);
        } else {
            let index = 0;
            let pageIndex = 0;

            for (const page of this.pages) {
                page.selected = false;
                page.index = index;
                if (uuid && page.uuid === uuid) {
                    pageIndex = index;
                }
                index += 1;
            }
            this.goToPageOnIndex(pageIndex);
        }
    }

    fulltextChanged(query: string, pageUuid: string = null) {
        this.fulltextQuery = query;
        this.fulltextAllPages = false;
        this.publishNewPages(BookPageState.Loading);
        if (!query) {
            this.cancelFulltext();
            return;
        }
        const uuids = [this.uuid].concat(this.supplementUuids);
        this.api.getDocumentFulltextPage(uuids, query).subscribe((result: any[]) => {
            this.ftPages = [];
            let index = 0;
            for (const page of this.allPages) {
                page.snippet = null;
                page.display = 2;
                for (const item of result) {
                    if (item['uuid'] === page.uuid) {
                        page.selected = false;
                        page.index = index;
                        page.display = 1;
                        page.snippet = item['snippet'];
                        index += 1;
                        this.ftPages.push(page);
                        break;
                    }
                }
            }
            this.fulltextAllPagesChanged(pageUuid);
        });
    }


    private showPdfDialog(type: string) {
        if (this.isPrivate && this.metadata.model === 'sheetmusic') {
            this.modalService.open(SimpleDialogComponent, {
                title: 'common.warning',
                message: 'dialogs.private_sheetmusic.message',
                button: 'common.close'
            });
        } else if (this.isPageInaccessible() && type === 'generate') { //this.isPrivate
            this.modalService.open(SimpleDialogComponent, {
                title: 'common.warning',
                message: 'dialogs.private_document_pdf.message',
                button: 'common.close'
            });
        } else {
            this.modalService.open(DialogPdfGeneratorComponent, {
                pageCount: this.getPageCount(),
                currentPage: this.getPage().index,
                doublePage: this.doublePage,
                pages: this.pages,
                type: type,
                name: this.metadata.getShortTitle(),
                uuid: this.getUuid()
            });
        }
    }

    private uuids(): string[] {
        const uuids = [];
        for (const page of this.pages) {
            uuids.push(page.uuid);
        }
        return uuids;
    }

    toggleDoublePage() {
        this.doublePageEnabled = !this.doublePageEnabled;
        this.localStorageService.setProperty(LocalStorageService.DOUBLE_PAGE, this.doublePageEnabled ? '1' : '0');
        this.goToPage(this.getPage());
    }

    doublePageSupported() {
        return !this.fulltextQuery && this.getPage() && (this.getPage().position === PagePosition.Left || this.getPage().position === PagePosition.Right);
    }

    goToPageOnIndex(index: number, replaceState = false) {
        this.viewer = 'image';
        if (index >= this.pages.length) {
            return;
        }
        const lastLeftPage = this.getPage();
        if (lastLeftPage) {
            lastLeftPage.selected = false;
        }
        const lastRightPage = this.getRightPage();
        if (lastRightPage) {
            lastRightPage.selected = false;
        }
        const position = this.pages[index].position;
        if (position === PagePosition.Single || !this.doublePageEnabled || this.fulltextQuery) {
            this.activePageIndex = index;
            this.doublePage = false;
        } else if (position === PagePosition.Left) {
            this.activePageIndex = index;
            this.doublePage = true;
        } else if (position === PagePosition.Right) {
            this.activePageIndex = index - 1;
            this.doublePage = true;
        }
        const page = this.getPage();
        page.selected = true;

        if (page.supplementUuid) {
            const uuid = page.supplementUuid;
            this.api.getMetadata(uuid, 'supplement').subscribe((metadata: Metadata) => {
                if (uuid === this.getPage().supplementUuid) {
                    this.metadata.pageSupplementMetadata = metadata;
                }
            });
        } else {
            this.metadata.pageSupplementMetadata = null;
        }

        let pages = page.number + '';
        const rightPage = this.getRightPage();
        let cached = page.loaded;
        if (rightPage) {
            rightPage.selected = true;
            cached = cached && rightPage.loaded;
            pages += '-' + rightPage.number;
        }
        if (this.metadata) {
            this.metadata.activePages = pages;
            this.metadata.activePage = page;
            if (rightPage) {
                this.metadata.activePageRight = rightPage;
            } else {
                this.metadata.activePageRight = null;
            }
        }
        let urlQuery = 'page=' + page.uuid;
        if (this.fulltextQuery) {
            urlQuery += '&fulltext=' + this.fulltextQuery;
        }
        if (replaceState) {
            this.location.replaceState(this.settings.getPathPrefix() + '/view/' + this.uuid, urlQuery);
        } else {
            this.location.go(this.settings.getPathPrefix() + '/view/' + this.uuid, urlQuery);
        }
        this.lastIndex = index;
        if (!cached) {
            this.publishNewPages(BookPageState.Loading);
            this.fetchPageData(page, rightPage);
        } else {
            if (page.imageType === PageImageType.PDF) {
                this.onPdfPageSelected(page, rightPage);
            } else {
                this.publishNewPages(BookPageState.Success);
            }
        }
    }


    isPageInaccessible() {
        return this.pageState === BookPageState.Inaccessible;
    }

    isPageFailure() {
        return this.pageState === BookPageState.Failure;
    }

    isDocLoading() {
        return this.bookState === BookState.Loading;
    }

    isPageLoading() {
        return this.pageState === BookPageState.Loading;
    }

    noFulltextResults() {
        return this.pageState === BookPageState.NoResults;
    }

    changeNavigationTab(tab: string) {
        if (this.activeNavigationTab === tab) {
            return;
        }
        if (this.metadata) {
            this.metadata.article = null;
            this.metadata.internalPart = null;
        }
        if (tab === 'pages') {
            this.article = null;
            this.internalPart = null;
        } else if (tab === 'articles') {
            this.fulltextQuery = null;
            this.fulltextAllPages = false;
        } else if (tab === 'internalparts') {
            this.fulltextQuery = null;
            this.fulltextAllPages = false;
        }
        this.activeNavigationTab = tab;
    }

    onInternalPartSelected(internalPart: InternalPart) {
        this.pdf = null;
        this.pdfPath = null;
        this.pageState = BookPageState.Loading;
        this.internalPart = internalPart;
        if (!internalPart.metadata) {
            forkJoin([this.api.getItem(internalPart.uuid), this.api.getMetadata(internalPart.uuid)]).subscribe(([item, metadata]: [DocumentItem, Metadata]) => {
                if (this.metadata) {
                    this.metadata.addToContext('internalpart', internalPart.uuid);
                }
                this.onInternalPartLoaded(internalPart);
                internalPart.metadata = metadata;
            });
        } else {
            this.onInternalPartLoaded(internalPart);
        }
    }

    private onInternalPartLoaded(internalPart: InternalPart) {
        this.metadata.internalPart = internalPart;
        if (internalPart.firstPageUuid) {
            this.pageState = BookPageState.Success;
            this.goToPageWithUuid(internalPart.firstPageUuid);
        } else {
            this.publishNewPages(BookPageState.Loading);
            this.api.getChildren(internalPart.uuid).subscribe(children => {
                if (children && children.length > 0) {
                    internalPart.firstPageUuid = children[0]['pid'];
                }
                this.pageState = BookPageState.Success;
                this.goToPageWithUuid(internalPart.firstPageUuid);
            });
        }
    }


    onArticleSelected(article: Article) {
        this.pdf = null;
        this.pdfPath = null;
        this.pageState = BookPageState.Loading;
        this.article = article;
        if (article.type === 'none') {
            forkJoin([this.api.getItem(article.uuid), this.api.getMetadata(article.uuid)]).subscribe(([item, metadata]: [DocumentItem, Metadata]) => {
                if (this.metadata) {
                    this.metadata.addToContext('article', article.uuid);
                }
                article.type = item.pdf ? 'pdf' : 'pages';
                this.onArticleLoaded(article);
                article.metadata = metadata;
            });
        } else {
            this.onArticleLoaded(article);
        }
    }

    private onArticleLoaded(article: Article) {
        this.metadata.article = article;
        if (article.type === 'pdf') {
            let urlQuery = 'article=' + article.uuid;
            if (this.fulltextQuery) {
                urlQuery += '&fulltext=' + this.fulltextQuery;
            }
            this.location.go(this.settings.getPathPrefix() + '/view/' + this.uuid, urlQuery);
            this.assignPdfPath(article.uuid);
        } else if (article.type === 'pages') {
            if (article.firstPageUuid) {
                this.pageState = BookPageState.Success;
                this.goToPageWithUuid(article.firstPageUuid);
            } else {
                this.publishNewPages(BookPageState.Loading);
                this.api.getChildren(article.uuid, false).subscribe(children => {
                    if (children && children.length > 0) {
                        article.firstPageUuid = children[0]['pid'];
                    }
                    this.pageState = BookPageState.Success;
                    this.goToPageWithUuid(article.firstPageUuid);
                });
            }
        }
    }

    private fetchPageData(leftPage: Page, rightPage: Page) {
        const itemRequests = [];
        itemRequests.push(this.api.getItemInfo(leftPage.uuid));
        if (rightPage) {
            itemRequests.push(this.api.getItemInfo(rightPage.uuid));
        }
        forkJoin(itemRequests).subscribe(result => {
            leftPage.assignPageData(result[0]);
            if (rightPage) {
                rightPage.assignPageData(result[1]);
            }
            if (leftPage.licences) {
                this.licence = leftPage.licence;
                this.metadata.licence = this.licence;
                this.licences = leftPage.licences;
            } else if (rightPage && rightPage.licence) {
                this.licence = rightPage.licence;
                this.metadata.licence = this.licence;
                this.licences = rightPage.licences;
            }
            if (leftPage.imageType === PageImageType.None) {
                this.publishNewPages(BookPageState.Failure);
            } else if (leftPage.imageType === PageImageType.PDF) {
                this.onPdfPageSelected(leftPage, rightPage);
            } else {
                this.publishNewPages(BookPageState.Success);
            }
        },
        (error: AppError)  => {
            if (error instanceof UnauthorizedError) {
                this.publishNewPages(BookPageState.Inaccessible);
            } else {
                this.publishNewPages(BookPageState.Failure);
            }
        });
    }

    private onPdfPageSelected(leftPage: Page, rightPage: Page) {
        if (rightPage) {
            rightPage.selected = false;
        }
        this.doublePageEnabled = false;
        this.assignPdfPath(leftPage.uuid);
    }

    public onInaccessibleImage() {
        if (this.doublePage && this.getRightPage()) {
            this.doublePageEnabled = false;
            this.goToPageOnIndex(this.lastIndex);
        } else {
            this.publishNewPages(BookPageState.Inaccessible);
        }
    }

    private publishNewPages(state: BookPageState) {
        this.logger.info('publishNewPages');
        const leftPage = this.getPage();
        const rightPage = this.getRightPage();
        if (state !== BookPageState.Success) {
            if (leftPage) {
                leftPage.clear();
            }
            if (rightPage) {
                rightPage.clear();
            }
        }
        this.pageState = state;
        this.subject.next(this.getViewerData());
        this.subjectPages.next([leftPage, rightPage]);
    }


    public getViewerData(): ViewerData {
        const data = new ViewerData();
        const leftPage = this.getPage();
        const rightPage = this.getRightPage();
        if (!leftPage || !leftPage.viewable()) {
            return null;
        }
        if (leftPage.imageType === PageImageType.TILES) {
            data.imageType = this.iiifEnabled ? ViewerImageType.IIIF : ViewerImageType.ZOOMIFY;
        } else {
            data.imageType = ViewerImageType.JPEG;
        }
        data.query = this.fulltextQuery;
        data.uuid1 = leftPage.uuid;
        if (rightPage) {
            data.uuid2 = rightPage.uuid;
        }
        return data;
    }


    clear() {
        this.pdf = null;
        this.pdfPath = null;
        this.bookState = BookState.None;
        this.pageState = BookPageState.None;
        this.doublePage = false;
        this.activeMobilePanel = 'viewer';
        this.pages = [];
        this.allPages = [];
        this.articles = [];
        this.article = null;
        this.internalParts = [];
        this.internalPart = null;
        this.activeNavigationTab = 'pages';
        this.navigationTabsCount = 0;
        this.showNavigationPanel = false;
        this.viewer = 'none';
        this.licence = null;
        this.licences = [];
        this.providedByLabel = '';
        this.iiifEnabled = false;
    }


    private computeDoublePageBounds(pageCount: number, titlePage: number, lastSingle: number, firstBackSingle: number) {
        const count = pageCount;
        let dblFirst = -1;
        let dblLast = -1;
        if (count < 2) {
          return null;
        }
        if (titlePage === 0) {
          // title page is the very first page - the first left page should be the second page;
          dblFirst = 1;
        } else if (titlePage === -1) {
          // there is no title page
          if (lastSingle === -1) {
            // there are neither single pages nor title pages
            dblFirst = 0;
          } else {
            // there is no title page. Some single pages are presented
            if (lastSingle < count - 1) {
              // the first double page should be the one after the last sigle page
              dblFirst = lastSingle + 1;
            } else {
              // last single page is also the very last page in the document - no double pages
              return null;
            }
          }
        } else {
          // there is at least one title page
          if (lastSingle > titlePage) {
            lastSingle = titlePage - 1;
          }
          let f = lastSingle + 1;
          const d = titlePage - f;
          if (d % 2 === 0) {
            f = f + 1;
          }
          dblFirst = f;
        }
        // handle last double page;
        if (dblFirst === -1 || dblFirst >= count - 1) {
            return null;
        }
        if (firstBackSingle === -1) {
            firstBackSingle = count;
        }
        let l = firstBackSingle - 1;
        const d = l - dblFirst;
        if (d % 2 === 0) {
          l = l - 1;
        }
        dblLast = l;
        if (dblLast - dblFirst < 1) {
            return null;
        }
        return[dblFirst, dblLast];
    }


}


export enum BookPageState {
    Success, Loading, Inaccessible, Failure, NoResults, None
}

export enum BookState {
    Success, Loading, Failure, None
}

export interface BookParams {
    uuid: string;
    pageUuid: string;
    articleUuid: string;
    internalPartUuid: string;
    fulltext: string;
}


export enum ViewerImageType {
    IIIF, ZOOMIFY, JPEG
  }

  export class ViewerData {
    uuid1: string;
    uuid2: string;
    imageType: ViewerImageType;
    query: string;

    doublePage(): boolean {
      return !!this.uuid2;
    }

    equals(to: ViewerData): boolean {
        if (!to) {
            return false;
        }
        return this.uuid1 === to.uuid1 && this.uuid2 === to.uuid2 && this.query === to.query && this.imageType === to.imageType;
    }

  }

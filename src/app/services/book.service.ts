import { AppSettings } from './app-settings';
import { DocumentItem } from './../model/document_item.model';
import { Metadata } from './../model/metadata.model';
import { AltoService } from './alto-service';
import { LocalStorageService } from './local-storage.service';
import { NotFoundError } from './../common/errors/not-found-error';
import { UnauthorizedError } from './../common/errors/unauthorized-error';
import { AppError } from './../common/errors/app-error';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { KrameriusApiService } from './kramerius-api.service';
import { Page, PagePosition, PageImageType } from './../model/page.model';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { forkJoin} from 'rxjs';
import { Article } from '../model/article.model';
import { HistoryService } from './history.service';
import { DomSanitizer} from '@angular/platform-browser';
import { PageTitleService } from './page-title.service';
import { InternalPart } from '../model/internal_part.model';
import { AnalyticsService } from './analytics.service';
import { IiifService } from './iiif.service';
import { LoggerService } from './logger.service';
import { PeriodicalItem } from '../model/periodicalItem.model';
import { LicenceService } from './licence.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { PdfDialogComponent } from '../dialog/pdf-dialog/pdf-dialog.component';
import { BasicDialogComponent } from '../dialog/basic-dialog/basic-dialog.component';
import { OcrDialogComponent } from '../dialog/ocr-dialog/ocr-dialog.component';
import { TranslateService } from '@ngx-translate/core';

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

    public iiifEnabled = false;

    public extraParents = [];

    constructor(private location: Location,
        private altoService: AltoService,
        private settings: AppSettings,
        private pageTitle: PageTitleService,
        private analytics: AnalyticsService,
        private localStorageService: LocalStorageService,
        private api: KrameriusApiService,
        private iiif: IiifService,
        private dialog: MatDialog,
        private logger: LoggerService,
        private translate: TranslateService,
        private sanitizer: DomSanitizer,
        private history: HistoryService,
        private router: Router,
        private bottomSheet: MatBottomSheet,
        private licenceService: LicenceService) {
    }

    private assignPdfPath(uuid: string) {
        this.viewer = 'pdf';
        this.publishNewPages(BookPageState.Loading);
        this.api.getPdfPreviewBlob(uuid).subscribe(() => {
            this.publishNewPages(BookPageState.Success);
            if (uuid === null) {
                this.pdf = null;
                this.pdfPath = null;
                return;
            }
            this.pdf = this.api.getPdfUrl(uuid);
            let url = 'assets/pdf/viewer.html?file=' + encodeURIComponent(this.pdf);
            url += '&lang=' + this.translate.currentLang;
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
        console.log('init', params);
        this.clear();
        this.extraParents = [];
        this.uuid = params.uuid;
        this.fulltextQuery = params.fulltext;
        this.bookState = BookState.Loading;
        this.iiifEnabled =  this.settings.iiifEnabled;

        if (params.uuid == 'epub') {
            this.bookState = BookState.Success;
            this.setupEpub();
            return;
        }


        this.api.getItem(params.uuid).subscribe((item: DocumentItem) => {
            this.licences = this.licenceService.availableLicences(item.licences);
            this.licence = item.licence;
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
            } 
            if (item.doctype === 'internalpart') {
                const parentUuid = item.getParentUuid();
                if (parentUuid) {
                    this.history.removeCurrent();
                    this.router.navigate(['/view', parentUuid], { replaceUrl: true, queryParams: { chapter: params.uuid, fulltext: this.fulltextQuery } });
                }
                return;
            }
            if (item.doctype == 'oldprintomnibusvolume') {
                const maxPages = this.settings.maxOmnibusPages;
                const maxParts = this.settings.maxOmnibusParts;
                if (!!maxPages && !!maxParts) {
                    this.api.getChildren(item.uuid).subscribe(children => {
                        this.api.getNumberOfRootsPages(item.uuid).subscribe(pageCount => {
                            if (children.length > maxParts || pageCount > maxPages) {
                                if (!params.pageUuid) {
                                    this.router.navigate(['/view', children[0].pid], { replaceUrl: true, queryParams: { fulltext: this.fulltextQuery } });
                                } else {
                                    this.api.getItem(params.pageUuid).subscribe((item: DocumentItem) => {
                                        this.router.navigate(['/view', item.getParentUuid()], { replaceUrl: true, queryParams: { page: params.pageUuid, fulltext: this.fulltextQuery } });
                                    });
                                }
                            } else {
                                this.getMetadata(item, params);
                            }
                        });
                    });
                    return;
                }
            }
            if (item.getParentDoctype() == 'oldprintomnibusvolume') {
                const maxPages = this.settings.maxOmnibusPages;
                const maxParts = this.settings.maxOmnibusParts;
                if (!maxPages || !maxParts) {
                    if (params.pageUuid) {
                        this.history.removeCurrent();
                        this.router.navigate(['/view', item.getParentUuid()], { replaceUrl: true, queryParams: { page: params.pageUuid, fulltext: this.fulltextQuery } });
                    } else {
                        this.router.navigate(['/view', item.getParentUuid()], { replaceUrl: true, queryParams: { parent: item.uuid, fulltext: this.fulltextQuery } });
                    }
                    return;
                }
                this.api.getChildren(item.getParentUuid()).subscribe(children => {
                    this.api.getNumberOfRootsPages(item.getParentUuid()).subscribe(pageCount => {
                        if (children.length > maxParts || pageCount > maxPages) {
                            this.getMetadata(item, params);
                        } else {
                            if (params.pageUuid) {
                                this.history.removeCurrent();
                                this.router.navigate(['/view', item.getParentUuid()], { replaceUrl: true, queryParams: { page: params.pageUuid, fulltext: this.fulltextQuery } });
                            } else {
                                this.router.navigate(['/view', item.getParentUuid()], { replaceUrl: true, queryParams: { parent: item.uuid, fulltext: this.fulltextQuery } });
                            }
                        }
                    });
                });
                return;
            }
            this.getMetadata(item, params);
        },
        error => {
            if (error instanceof NotFoundError) {
                this.router.navigateByUrl(this.settings.getRouteFor('404'), { skipLocationChange: true });
            }
        });
    }


    setupEpub() {
        this.viewer = 'epub';
        this.activeNavigationTab = 'epubToc';
        this.showNavigationPanel = true;
    }

    private getMetadata(item: DocumentItem, params: any) {
        this.isPrivate = !item.public;
        this.api.getMetadata(item.root_uuid).subscribe((metadata: Metadata) => {
            this.metadata = metadata;
            this.metadata.assignDocument(item);
            this.analytics.sendEvent('viewer', 'open', this.metadata.getShortTitle());
            this.pageTitle.setTitle(null, this.metadata.getShortTitle());
            if (item.getParentDoctype() == 'oldprintomnibusvolume') {
                this.metadata.doctype = 'oldprintomnibusvolume';
            } else if (item.doctype) {
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
            } else if (item.getParentDoctype() == 'oldprintomnibusvolume') {
                this.loadOmnibusUnits(item.getParentUuid(), item);
            }
            this.localStorageService.addToVisited(item, this.metadata);
            this.metadata.licences = this.licences;
            this.metadata.licence = this.licence;
            if (item.pdf) {
                this.showNavigationPanel = true;
                this.bookState = BookState.Success;
                this.assignPdfPath(params.uuid);
            } else {
                this.api.getChildren(params.uuid).subscribe(children => {
                    if (children && children.length > 0) {
                        this.onDataLoaded(children, item.doctype, params);
                    } else {
                        // TODO: Empty document
                        this.onDataLoaded(children, item.doctype, params);
                    }
                });
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
        this.api.getMonographUnits(monographUuid, null).subscribe((units: DocumentItem[]) => {
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
            this.metadata.currentUnit = { title: units[index].title };
            this.pageTitle.setTitle(null, this.metadata.getShortTitleWithUnit());
            if (index > 0) {
                this.metadata.previousUnit = {
                    title: units[index - 1].title,
                    uuid: units[index - 1].uuid
                };
            }
            if (index < units.length - 1) {
                this.metadata.nextUnit = {
                    title: units[index + 1].title,
                    uuid: units[index + 1].uuid
                };
            }
            this.api.getMetadata(unitUud).subscribe((metadata: Metadata) => {
                this.metadata.addToContext('monographunit', unitUud);
                this.metadata.currentUnit.metadata = metadata;
            });
        });
    }


    private loadOmnibusUnits(omnibusUuid: string, item: DocumentItem) {
        this.api.getChildren(omnibusUuid).subscribe(children => {
            if (!children || children.length < 1) {
                return;
            }
            let index = -1;
            for (let i = 0; i < children.length; i++) {
                if (children[i].pid == item.uuid) {
                    index = i;
                    break;
                }
            }
            if (index < 0) {
                return;
            }
            this.metadata.currentUnit = { title: children[index].title };
            this.pageTitle.setTitle(null, this.metadata.getShortTitleWithUnit());
            if (index > 0) {
                this.metadata.previousUnit = {
                    title: children[index - 1].title,
                    uuid: children[index - 1].pid
                };
            }
            if (index < children.length - 1) {
                this.metadata.nextUnit = {
                    title: children[index + 1].title,
                    uuid: children[index + 1].pid
                };
            }
            this.api.getMetadata(item.uuid).subscribe((metadata: Metadata) => {
                this.metadata.addToContext(item.doctype, item.uuid);
                this.metadata.currentUnit.metadata = metadata;
            });
        });
    }




    onParentSelected(parent: any) {
        for (const page of this.pages) {
            if (page.parentUuid == parent.pid) {
                this.goToPageOnIndex(page.index);
                return;
            }
        }
    }

    private addParentPages(pages: any[], parents: any[], doctype: string, params: BookParams) {
        if (parents.length === 0) {
            this.onDataLoaded(pages, null, params);
            return;
        }
        const parent = parents.shift();
        this.api.getChildren(parent['pid']).subscribe(children => {
            for (const p of children) {
                if (p['model'] === 'page') {
                    p['parent_uuid'] = parent['pid'];
                    p['parent_doctype'] = parent['model'];
                    pages.push(p);
                }
            }
            this.addParentPages(pages, parents, doctype, params);
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
        if (this.metadata.doctype == 'oldprintomnibusvolume' && this.extraParents.length > 0 && !this.fulltextQuery) {
            tabs += 1;
        }
        this.navigationTabsCount = tabs;
    }

    private onDataLoaded(inputPages: any[], doctype: string, params: BookParams) {
        this.pages = [];
        const pages = [];
        const parents = [];
        for (const p of inputPages) {
            if (p['model'] === 'supplement' || (doctype == 'oldprintomnibusvolume' && p['model'] != 'oldprintomnibusvolume' && p['model'] != 'page')) {
                parents.push(p);
                this.extraParents.push(p);
            } else {
                pages.push(p);
            }
        }
        if (parents.length > 0) {
            this.addParentPages(pages, parents, doctype, params);
            return;
        }
        const pageIndex = this.arrangePages(pages, params.pageUuid, doctype);
        this.bookState = BookState.Success;
        if (pageIndex === -1 || (this.pages.length === 0 && this.articles.length === 0)) {
            return;
        }
        this.showNavigationPanel = true;
        this.calcNavigationTabsCount();
        if (params.articleUuid || (!params.pageUuid && this.pages.length === 0)) {
            this.activeNavigationTab = 'articles';
            let articleForSelection = this.articles[0];
            if (params.articleUuid) {
                for (const article of this.articles) {
                    if (params.articleUuid === article.uuid) {
                        articleForSelection = article;
                        break;
                    }
                }
            }
            this.onArticleSelected(articleForSelection);
        } else if (params.internalPartUuid &&  this.internalParts &&  this.internalParts.length > 0) {
            this.activeNavigationTab = 'internalparts';
            let selection = this.internalParts[0];
            if (params.internalPartUuid) {
                for (const internalPart of this.internalParts) {
                    if (params.internalPartUuid === internalPart.uuid) {
                        selection = internalPart;
                        break;
                    }
                }
            }
            this.onInternalPartSelected(selection);
        }else if (params.parentUuid && !params.pageUuid) {
            this.activeNavigationTab = 'pages'; /// ??
            this.onParentSelected({ pid: params.parentUuid });
        } else {
            this.activeNavigationTab = 'pages';
            if (this.fulltextQuery) {
                this.fulltextChanged(this.fulltextQuery, params.pageUuid);
            } else {
                this.goToPageOnIndex(pageIndex, true);
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
                page.parentUuid = p['parent_uuid'];
                page.parentDoctype = p['parent_doctype'];
                page.public = p['policy'] === 'public';
                page.type = p['type'] ? p['type'].toLowerCase() : '';
                page.number = p['number'];
                page.licences = p['licences'];
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
                if ((page.type === 'backcover' || page.parentUuid) && firstBackSingle === -1) {
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
        }
    }

    goToPrevious() {
        if (this.hasPrevious()) {
            const index = this.activePageIndex - 1;
            this.goToPageOnIndex(index);
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
        return value === 'always' || (value === 'public' && !this.isPrivate);
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
                showCitation: this.isActionAvailable('citation')
            };
            if (result.length > 1) {
                options['ocr2'] = result[1];
            }
            this.bottomSheet.open(OcrDialogComponent, { data: options });
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
                    showCitation: this.isActionAvailable('citation')
                };
                this.bottomSheet.open(OcrDialogComponent, { data: options });
            },
            error => {
                if (error instanceof NotFoundError) {
                    this.dialog.open(BasicDialogComponent, { data: {
                        title: 'common.warning',
                        message: 'dialogs.missing_alto.message',
                        button: 'common.close'
                    }, autoFocus: false });
                }
            }
        );
    }

    showImageCrop(extent, right: boolean) {
        if (this.pageState === BookPageState.Inaccessible) {
            this.dialog.open(BasicDialogComponent, { data: {
                title: 'common.warning',
                message: 'dialogs.private_document_jpeg.message',
                button: 'common.close'
            }, autoFocus: false });
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
            this.dialog.open(BasicDialogComponent, { data: {
                title: 'common.warning',
                message: 'dialogs.private_document_jpeg.message',
                button: 'common.close'
            }, autoFocus: false });
        } else if (this.pageState === BookPageState.Success) {
            if (this.iiifEnabled) {
                window.open(this.iiif.getIiifImage(this.api.getIiifBaseUrl(this.getPage().uuid)), '_blank');
                if (this.getRightPage()) {
                    window.open(this.iiif.getIiifImage(this.api.getIiifBaseUrl(this.getRightPage().uuid)), '_blank');
                }
            } else {
                window.open(this.api.getFullJpegUrl(this.getPage().uuid), '_blank');
                if (this.getRightPage()) {
                    window.open(this.api.getFullJpegUrl(this.getRightPage().uuid), '_blank');
                }
            }
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
        this.calcNavigationTabsCount();
        if (!query) {
            this.cancelFulltext();
            return;
        }
        const uuids = [this.uuid];
        for (const p of this.extraParents) {
            uuids.push(p.pid);
        }
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
            this.dialog.open(BasicDialogComponent, { data: {
                title: 'common.warning',
                message: 'dialogs.private_sheetmusic.message',
                button: 'common.close'
            }, autoFocus: false });
        } else if (this.isPrivate && type === 'generate') {
            this.dialog.open(BasicDialogComponent, { data: {
                title: 'common.warning',
                message: 'dialogs.private_document_pdf.message',
                button: 'common.close'
            }, autoFocus: false });
        } else {
            const opts = {
                pageCount: this.getPageCount(),
                currentPage: this.getPage().index,
                doublePage: this.doublePage,
                pages: this.pages,
                type: type,
                name: this.metadata.getShortTitle()
            };
            this.dialog.open(PdfDialogComponent, { data: opts, autoFocus: false });
        }
    }

    toggleDoublePage() {
        this.doublePageEnabled = !this.doublePageEnabled;
        this.localStorageService.setProperty(LocalStorageService.DOUBLE_PAGE, this.doublePageEnabled ? '1' : '0');
        this.goToPage(this.getPage());
    }

    doublePageSupported() {
        return !this.fulltextQuery && this.getPage() && (this.getPage().position === PagePosition.Left || this.getPage().position === PagePosition.Right);
    }

    isEpub(): boolean {
        return this.viewer == 'epub';
     }

    isPdf(): boolean {
       return this.viewer == 'pdf';
    }

    isImage(): boolean {
        return this.viewer == 'image';
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

        if (page.parentUuid) {
            const uuid = page.parentUuid;
            this.api.getMetadata(uuid).subscribe((metadata: Metadata) => {
                if (uuid === this.getPage().parentUuid) {
                    this.metadata.extraParentMetadata = metadata;
                    metadata.doctype = page.parentDoctype;
                }
            });
        } else {
            this.metadata.extraParentMetadata = null;
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
            //// doc license from the page ????
            this.licence = page.licence;
            if (rightPage && !this.licence) {
                this.licence = rightPage.licence;
            }
            this.metadata.licence = this.licence;
            ////
            if (page.imageType === PageImageType.None) {
                this.publishNewPages(BookPageState.Failure);
            } else if (page.imageType === PageImageType.PDF) {
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

    isPageSuccess() {
        return this.pageState === BookPageState.Success;
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
        if (tab == 'pages') {
            this.goToPage(this.getPage());
        }
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
            if (this.metadata) {
                this.metadata.addToContext('article', article.uuid);
            }
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
            //// doc license from the page ????
            this.licence = leftPage.licence;
            if (rightPage && !this.licence) {
                this.licence = rightPage.licence;
            }
            this.metadata.licence = this.licence;
            ////
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
    parentUuid: string;
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
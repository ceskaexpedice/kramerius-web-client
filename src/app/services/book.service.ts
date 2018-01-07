import { AltoService } from './alto-service';
import { LocalStorageService } from './local-storage.service';
import { DialogShareComponent } from './../dialog/dialog-share/dialog-share.component';
import { DialogPdfComponent } from './../dialog/dialog-pdf/dialog-pdf.component';
import { NotFoundError } from './../common/errors/not-found-error';
import { UnauthorizedError } from './../common/errors/unauthorized-error';
import { AppError } from './../common/errors/app-error';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { KrameriusApiService } from './kramerius-api.service';
import { Page, PagePosition } from './../model/page.model';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MzModalService } from 'ng2-materialize';
import { DialogOcrComponent } from '../dialog/dialog-ocr/dialog-ocr.component';
import { request } from 'https';


@Injectable()
export class BookService {

    private fulltextQuery = null;

    private uuid;
    private subject = new Subject<Page[]>();

    private activePageIndex = 0;
    private allPages: Page[] = [];
    public pages: Page[] = [];
    private ftPages: Page[] = [];
    public doublePage = false;
    public doublePageEnabled = false;

    public pageState: BookPageState;
    public bookState: BookState = BookState.Loading;

    public fulltextAllPages = false;

    constructor(private location: Location,
        private altoService: AltoService,
        private localStorageService: LocalStorageService,
        private krameriusApiService: KrameriusApiService,
        private modalService: MzModalService) {
    }

    init(uuid: string, data: any[], pageUuid: string, fulltext: string) {
        this.uuid = uuid;
        this.fulltextQuery = fulltext;
        let index = 0;
        let currentPage = 0;
        let firstBackSingle = -1;
        let titlePage = -1;
        let lastSingle = -1;
        this.doublePageEnabled = this.localStorageService.getProperty(LocalStorageService.DOUBLE_PAGE) === '1';
        data.forEach(p => {
            if (p['model'] === 'page') {
                const page = new Page();
                page.uuid = p['pid'];
                if (pageUuid === page.uuid) {
                    currentPage = index;
                }
                page.policy = p['policy'];
                const details = p['details'];
                if (details) {
                    page.type = details['type'];
                    if (page.type) {
                        page.type = page.type.toLowerCase();
                    }
                    page.number = details['pagenumber'];
                }
                if (!page.number) {
                    page.number = p['title'];
                }
                page.index = index;
                page.thumb = this.krameriusApiService.getThumbUrl(page.uuid);

                if (page.type === 'backcover' && firstBackSingle === -1) {
                    firstBackSingle = index;
                } else if (page.type === 'titlepage') {
                    titlePage = index;
                } else if (titlePage === -1 && (page.type === 'frontcover'
                            || page.type === 'cover'
                            || page.type === 'frontjacket'
                            || page.type === 'jacket'
                            || page.type === 'spine')) {
                    lastSingle = index;
                }
                page.position = PagePosition.Single;
                this.pages.push(page);
                this.allPages.push(page);
                index += 1;
            }
        });
        const bounds = this.computeDoublePageBounds(this.pages.length, titlePage, lastSingle, firstBackSingle);
        if (bounds !== null) {
            for (let i = bounds[0]; i < bounds[1]; i += 2) {
                this.pages[i].position = PagePosition.Left;
                this.pages[i + 1].position = PagePosition.Right;
            }
        }

        this.bookState = BookState.Success;
        if (this.fulltextQuery) {
            this.fulltextChanged(this.fulltextQuery, pageUuid);
        } else {
            this.goToPageOnIndex(currentPage);
        }
    }

    getFulltextQuery(): string {
        return this.fulltextQuery;
    }

    getPage() {
        return this.pages[this.activePageIndex];
    }

    getRightPage() {
        if (this.doublePage) {
            return this.pages[this.activePageIndex + 1];
        } else {
            return null;
        }
    }

    watchPage(): Observable<Page[]> {
        return this.subject.asObservable();
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
            this.goToPageOnIndex(this.activePageIndex + n);
        }
    }

    goToPrevious() {
        if (this.hasPrevious()) {
            this.goToPageOnIndex(this.activePageIndex - 1);
        }
    }

    isEmpty(): boolean {
        return this.pages === null || this.pages.length === 0;
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


    showQuotation() {

    }

    showOcr() {
        const requests = [];
        requests.push(this.krameriusApiService.getOcr(this.getPage().uuid));
        if (this.getRightPage()) {
            requests.push(this.krameriusApiService.getOcr(this.getRightPage().uuid));
        }
        Observable.forkJoin(requests).subscribe(result => {
            const options = {
                ocr: result[0]
            };
            if (result.length > 1) {
                options['ocr2'] = result[1];
            }
            this.modalService.open(DialogOcrComponent, options);
        });
    }

    showJpeg() {
        window.open(this.krameriusApiService.getFullJpegUrl(this.getPage().uuid), '_blank');
        if (this.getRightPage()) {
            window.open(this.krameriusApiService.getFullJpegUrl(this.getRightPage().uuid), '_blank');
        }
    }

    generatePdf() {
        this.showPdfDialog('generate');
    }

    prepareToPrint() {
        this.showPdfDialog('prepare');
    }

    showShareDialog() {
        const options = {
            link: this.getPagePersistentLink()
        };
        this.modalService.open(DialogShareComponent, options);
    }

    cancelFulltext() {
        const currentPage = this.getPage();
        let index = 0;
        this.pages = [];
        for (const page of this.allPages) {
            page.selected = false;
            page.hidden = false;
            page.index = index;
            index += 1;
            this.pages.push(page);
        }
        if (currentPage) {
            this.goToPageWithUuid(currentPage.uuid);
        } else {
            this.goToPageOnIndex(0);
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
            this.location.go('/view/' + this.uuid, 'fulltext=' + this.fulltextQuery);
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
        this.krameriusApiService.getFulltextUuidList(this.uuid, query).subscribe(result => {
            this.ftPages = [];
            let index = 0;
            for (const page of this.allPages) {
                page.hidden = true;
                for (const uuid of result) {
                    if (uuid === page.uuid) {
                        page.selected = false;
                        page.index = index;
                        page.hidden = false;
                        index += 1;
                        this.ftPages.push(page);
                        break;
                    }
                }
            }
            this.fulltextAllPagesChanged(pageUuid);
        });
    }

    private getPagePersistentLink() {
        const link = location.protocol + '//' + location.host + '/uuid/' + this.getPage().uuid;
        return link;
    }

    private showPdfDialog(type: string) {
        const options = {
            pageCount: this.getPageCount(),
            currentPage: this.getPage().index,
            doublePage: this.doublePage,
            maxPageCount: 150,
            uuids: this.uuids(),
            type: type
        };
        this.modalService.open(DialogPdfComponent, options);
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

    goToPageOnIndex(index: number) {
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
        const rightPage = this.getRightPage();
        let cached = page.hasImageData();
        if (rightPage) {
            rightPage.selected = true;
            cached = cached && rightPage.hasImageData();
        }
        let urlQuery = 'page=' + page.uuid;
        if (this.fulltextQuery) {
            urlQuery += '&fulltext=' + this.fulltextQuery;
        }
        this.location.go('/view/' + this.uuid, urlQuery);
        if (!cached) {
            this.publishNewPages(BookPageState.Loading);
            this.fetchImageProperties(page, rightPage, true);
        } else {
            this.publishNewPages(BookPageState.Success);
        }
    }






    isPageInaccessible() {
        return this.pageState === BookPageState.Inaccessible;
    }

    isPageFailure() {
        return this.pageState === BookPageState.Failure;
    }

    isLoading() {
        return this.bookState === BookState.Loading || this.pageState === BookPageState.Loading;
    }

    noFulltextResults() {
        return this.pageState === BookPageState.NoResults;
    }




    private fetchImageProperties(leftPage: Page, rightPage: Page, first: boolean) {
        const page = first ? leftPage : rightPage;
        const url = this.krameriusApiService.getZoomifyRootUrl(page.uuid);
        this.krameriusApiService.getZoomifyProperties(page.uuid).subscribe(
            response => {
                const a = response.toLowerCase().split('"');
                const width = parseInt(a[1], 10);
                const height = parseInt(a[3], 10);
                page.setImageProperties(width, height, url, true);
                if (first && rightPage) {
                    this.fetchImageProperties(leftPage, rightPage, false);
                } else {
                    this.publishNewPages(BookPageState.Success);
                }
            },
            (error: AppError)  => {
                if (error instanceof UnauthorizedError) {
                    // Private document
                    this.publishNewPages(BookPageState.Inaccessible);
                } else if (error instanceof NotFoundError) {
                    // Not zoomify
                    const jepgUrl = this.krameriusApiService.getScaledJpegUrl(page.uuid, 3000);
                    const image = new Image();
                    const subject = this.subject;
                    image.onload = (() => {
                        page.setImageProperties(image.width, image.height, jepgUrl, false);
                        if (first && rightPage) {
                            this.fetchImageProperties(leftPage, rightPage, false);
                        } else {
                            this.publishNewPages(BookPageState.Success);
                        }
                    });
                    image.onerror = (() => {
                        // JPEF failure
                        image.onerror = null;
                        this.publishNewPages(BookPageState.Failure);
                    });
                    image.src = jepgUrl;
                } else {
                    // Zoomify failure
                    this.publishNewPages(BookPageState.Failure);
                }
            }
        );
    }


    private publishNewPages(state: BookPageState) {
        const leftPage = this.getPage();
        const rightPage = this.getRightPage();
        if (leftPage) {
            leftPage.altoBoxes = null;
        }
        if (rightPage) {
            rightPage.altoBoxes = null;
        }
        if (state !== BookPageState.Success) {
            if (leftPage) {
                leftPage.setImageProperties(-1, -1, null, true);
            }
            if (rightPage) {
                rightPage.setImageProperties(-1, -1, null, true);
            }
        }
        this.pageState = state;
        if (state === BookPageState.Success && this.fulltextQuery) {
            this.krameriusApiService.getAlto(leftPage.uuid).subscribe(response => {
                const boxes = this.altoService.getBoxes(response, this.fulltextQuery, leftPage.width, leftPage.height);
                leftPage.altoBoxes = boxes;
                this.subject.next([leftPage, rightPage]);
            });
        } else {
            this.subject.next([leftPage, rightPage]);
        }
    }


    clear() {
        this.pageState = BookPageState.None;
        this.pages = [];
        this.allPages = [];
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

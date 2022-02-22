import { Injectable } from '@angular/core';
import { PdfViewerComponent } from 'ng2-pdf-viewer';

@Injectable()
export class PdfService {


    pageIndex: number;
    totalPages: number;
    outline;
    searching = false
    searchQuery: string;
    lastSearchQuery: string;
    zoom: number = 1;
    lastZoom: number = 1;



    constructor() {}

    private pdfComponent: PdfViewerComponent;


    init(data: any, pdfComponent: PdfViewerComponent) {
        this.pdfComponent = pdfComponent;
        this.outline = [];
        this.pageIndex = 1;
        this.totalPages = data.numPages;
        data.getOutline().then((outline: any[]) => {
            this.outline = outline;
            this.assignRange(this.outline, this.totalPages);
        });
        setTimeout(()=>{                          
           this.pageIndex = 1;
        }, 50);
    }

    assignRange(items: any, last: number) {
        const link = this.pdfComponent.pdfLinkService
        for (let i = items.length - 1; i >= 0; i --) {
            const item = items[i];
            if (!item.dest || item.dest.length == 0) {
                items.splice(i, 0);
            }
            link.pdfDocument.getPageIndex(item.dest[0]).then(pageIndex => {
                item.pageIndex = pageIndex;
                if (i + 1 >= items.length) {
                    item.endIndex = last;
                } else {
                    item.endIndex = items[i + 1].pageIndex - 1;
                }
                if (item.items) {
                    this.assignRange(item.items, item.endIndex);
                }
            });
        }   
    }


    isChapterActive(chapter: any, skipWithItems = false): boolean {
        if (skipWithItems && chapter.items) {
            for (const item of chapter.items) {
                if (this.isChapterActive(item)) {
                    return false;
                }
            }
        }
        return this.pageIndex - 1 >= chapter.pageIndex && this.pageIndex - 1 <= chapter.endIndex;
    }
    setZoom(zoom: number) {
        this.zoom = zoom;
        this.lastZoom = zoom;
    }

    zoomIn() {
        this.zoom += 0.2;
        this.lastZoom = this.zoom;
    }

    zoomOut() {
        this.zoom -= 0.2;
        this.lastZoom = this.zoom;
    }

    onSearch() {
        if (!this.searchQuery) {
            this.cleanQuery();
            return;
        }
        // this.searching = true;
        if (this.lastSearchQuery !== this.searchQuery) {
            this.lastSearchQuery = this.searchQuery;
            this.pdfComponent.pdfFindController.executeCommand('find', {
              query: this.searchQuery,
              highlightAll: true
            });
        } else {
            this.pdfComponent.pdfFindController.executeCommand('findagain', {
                query: this.searchQuery,
                highlightAll: true
            });
        }
    }


    cleanQuery() {
        this.searchQuery = "";
        this.lastSearchQuery = "";
        this.pdfComponent.pdfFindController.executeCommand('find', {
            query: this.searchQuery,
            highlightAll: true
        });
        // this.searching = false;
    }

    goToPage(index: number) {
        if (index < 1 || index > this.totalPages) {
            return;
        }
        this.pageIndex = index;
    }

    goTo(destination: any) {
        this.pdfComponent.pdfLinkService.navigateTo(destination);



    }

    hasNext(): boolean {
        return this.pageIndex < this.totalPages;
    }

    hasPrevious(): boolean {
        return this.pageIndex > 1;
    }

    goToNext() {
        if (!this.hasNext()) {
            return;
        }
        this.pageIndex += 1;
    }

    goToPrevious() {
        if (!this.hasPrevious()) {
            return;
        }
        this.pageIndex -= 1;
    }

}

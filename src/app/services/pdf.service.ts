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
        });
        setTimeout(()=>{                          
           this.pageIndex = 1;
        }, 50);
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

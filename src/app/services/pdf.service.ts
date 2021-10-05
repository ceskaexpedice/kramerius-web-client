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


    constructor() {}

    private pdfComponent: PdfViewerComponent;


    init(data: any, pdfComponent: PdfViewerComponent) {
        this.pdfComponent = pdfComponent;
        this.outline = [];
        this.pageIndex = 1;
        this.totalPages = data.numPages;
        data.getOutline().then((outline: any[]) => {
            console.log('outline', outline);
            this.outline = outline;
        });
    }

    onSearch() {
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

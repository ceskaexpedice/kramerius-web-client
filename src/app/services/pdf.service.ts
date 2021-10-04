import { Injectable } from '@angular/core';

@Injectable()
export class PdfService {


    pageIndex: number;
    totalPages: number;

    constructor() {}

    init(totalPages: number) {
        this.pageIndex = 1;
        this.totalPages = totalPages;
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

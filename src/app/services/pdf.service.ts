import { Injectable } from '@angular/core';

@Injectable()
export class PdfService {


    pageIndex: number;
    totalPages: number;

    constructor() {}

    init(data: any) {
        this.pageIndex = 1;
        this.totalPages = data.numPages;
        data.getOutline().then((outline: any[]) => {
            console.log('outline', outline);
        });
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

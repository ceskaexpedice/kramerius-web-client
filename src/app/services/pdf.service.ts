import { Injectable } from '@angular/core';
import { PDFDocumentProxy, PdfViewerComponent } from 'ng2-pdf-viewer';
import { AppSettings } from './app-settings';

@Injectable()
export class PdfService {

    url: string;
    pdfObject: any;
    pageIndex: number;
    totalPages: number;
    outline;
    searching = false
    searchQuery: string;
    lastSearchQuery: string;
    zoom: number = 1;
    lastZoom: number = 1;
    pdfLoading: boolean;
    index = 1;
    data: PDFDocumentProxy;

    constructor(private settings: AppSettings) {}

    private pdfComponent: PdfViewerComponent;


    setUrl(url: string, pageIndex = 1) {
        this.pdfLoading = true;
        this.index = pageIndex;
        this.url = url;
        const token = this.settings.getToken();
        if (token) {
            this.pdfObject = {
                url: url,
                httpHeaders: { Authorization: 'Bearer ' + token }
            }
        } else {
            this.pdfObject = { url: url };
        }
    }

    clear() {
        this.url = null;
        this.pdfObject = null;
    }

    init(data: PDFDocumentProxy, pdfComponent: PdfViewerComponent) {
        this.pdfComponent = pdfComponent;
        this.data = data;
        this.outline = [];
        this.totalPages = data.numPages;
        data.getOutline().then((outline: any[]) => {
            this.outline = outline;
            this.assignRange(this.outline, this.totalPages);
        });
        setTimeout(()=>{                  
            this.goToPage(this.index);
        }, 50);
    }

    assignRange(items: any, last: number) {
        if (!items) {
            return;
        }
        const link = this.pdfComponent.pdfLinkService
        for (let i = items.length - 1; i >= 0; i --) {
            const item = items[i];
            if (Array.isArray(item.dest)) {
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
            } else {
                link.pdfDocument.getDestination(item.dest).then(dest => {
                    link.pdfDocument.getPageIndex(dest[0]).then(pageIndex => {        
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
                });
            }
            // if (!item.dest || item.dest.length == 0) {
            //     items.splice(i, 0);
            // }
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
    }

    goToPage(index: number) {
        if (index < 1 || index > this.totalPages) {
            return;
        }
        this.pageIndex = index;
    }

    goTo(destination: any) {
        this.pdfComponent.pdfLinkService.goToDestination(destination);
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

    getPageContent() {
        console.log('pageIndex', this.pdfComponent.pdfViewer.getPageView(this.pageIndex));
        this.data.getPage(this.pageIndex).then((page) => {
            page.getTextContent().then((textContent) => {
                let creepychars = ['¬']
                console.log('textContent', textContent);
                if (textContent && textContent.items.length > 0) {
                    let items = textContent.items;
                    let finalString = "";
                    let EOLHeight = [];
                    let fontType = textContent.items[0]['fontName'];
                    let fontHeight = textContent.items[0]['height'];
                    let lineHeight = textContent.items[0]['transform'][5];
                    // EOLHeight.push(items[0]['transform'][5]);
                    let i = 0;
                    let averageFontHeight = this.averageFontHeight(items);
                    let averageLineHeight = this.averageLine(items);
                    for (const item of items) {
                        
                        // finalString += item['str'] + '( ' + item['transform'][5] + ')';
                        // KONEC RADKU - neni vzdy realny, nekdy je text clenen po odstavcich
                        if (item['hasEOL'] === true) {
                            // finalString += ' XXX' + "\n";
                            finalString += "\n";
                            EOLHeight.push(item['transform'][5]);
                        }
                        // ZMENA FONTU
                        // if (item['fontName'] !== fontType) {
                        //     // finalString += "\n" + 'FONT CHANGED' + " " + i + "\n\n";
                        //     finalString += "\n\n";
                        //     fontType = item['fontName'];
                        //     // continue;
                        // }
                        // ZMENA VYSKY FONTU
                        // if (item['height'] !== 0 && this.significantChangeOfFontHeight(item['height'], fontHeight)) {
                        //     finalString += "\n" + 'CHAR HEIGHT CHANGED' + " " + i + "\n\n";
                        //     // finalString += "\n\n";
                        //     fontHeight = item['height'];
                        //     // console.log('HEIGHT CHANGED', fontHeight, item['height']);
                        // }
                        // ZMENA VYSKY RADKU - nekdy je string jeden radek, nekdy je clenen po odstavcich, pak to nefunguje
                        // if (item['height'] !== 0) {
                        //     if (this.significantChangeOfLineHeight(item['transform'][5], lineHeight, item['height'], averageFontHeight, item['str'])) {
                        //         // finalString += "\n" + 'LINE HEIGHT CHANGED' + " " + i + "\n\n";
                                
                        //         finalString += "\n\n";
                        //         lineHeight = item['transform'][5];
                        //         fontHeight = item['height'];
                        //     } else {
                        //         lineHeight = item['transform'][5];
                        //         fontHeight = item['height'];
                        //     }
                        // }
                        // finalString += item['str'];
                        // i = i + 1;
                        if (item['height'] !== 0) {
                            let line = lineHeight - item['transform'][5];
                            if (line > averageLineHeight * 1.5) {
                                finalString += "\n\n";
                            }
                            lineHeight = item['transform'][5];
                        }
                        finalString += item['str'];
                    }
                    console.log(finalString.replace(/\n{3,}/g, "\n\n"));
                    // console.log(finalString, "pozice od spodniho okraje: " + EOLHeight, Object.keys(textContent.styles).length);
                } else {
                    console.log('no text');
                }            
            });
          });
    }

    significantChangeOfFontHeight(itemHeight: number, previousItemHeight: number): boolean {
        return (Math.abs((itemHeight + previousItemHeight)/2) > itemHeight || Math.abs((itemHeight + previousItemHeight)/2) < itemHeight - 1); 
    }
    significantChangeOfLine(itemLine: number, previousItemLine: number, fontHeight: number, averageLineHeight: number): boolean {
        if (((previousItemLine - itemLine) - fontHeight) > fontHeight + 1) {
            console.log('significantChangeOfLine', (previousItemLine - itemLine) - fontHeight, previousItemLine, itemLine, fontHeight, averageLineHeight);
            return true;
        } else {
            return false;
        }
    }

    significantChangeOfLineHeight(itemLine: number, previousItemLine: number, fontHeight: number, averageFontHeight: number, str: string): boolean {
        if (averageFontHeight > fontHeight) {
            if (((previousItemLine - itemLine) - fontHeight) > averageFontHeight + 2) {
                console.log('significantChangeOfLine', (previousItemLine - itemLine) - fontHeight, 'font: ' + fontHeight, 'aveFont: ' + averageFontHeight, previousItemLine, itemLine, str );
                return true;
            } else {
                return false;
            }
        } else {
            if (((previousItemLine - itemLine) - fontHeight) > fontHeight + 2) {
                console.log('significantChangeOfLine', (previousItemLine - itemLine) - fontHeight, 'font: ' + fontHeight, 'aveFont: ' + averageFontHeight, previousItemLine, itemLine, str );
                return true;
            } else {
                return false;
            }
        }
    }
    averageLineHeight(items: any): number {
        let sum = 0;
        let i = 0;
        for (const item of items) {
            if (item['height'] !== 0) {
                sum += item['height'];
                i = i + 1;
            }
        }
        return sum / i;
    }
    averageFontHeight(items: any): number {
        let sum = 0;
        let i = 0;
        for (const item of items) {
            if (item['height'] !== 0) {
                sum += item['height'];
                i = i + 1;
            }
        }
        return sum / i;
    }

    averageLine(items: any): number {
        let sum = 0;
        let i = 0;
        let lineHeight = items[0]['transform'][5];
        let lineHeights = [];
        for (const item of items) {
            if (item['height'] !== 0) {
                if ((item['transform'][5] !== lineHeight) && (Math.abs(item['transform'][5] - lineHeight) > 5)) {
                    // console.log((lineHeight - item['transform'][5]), lineHeight, item['transform'][5], item['height'], Math.abs(item['transform'][5] - lineHeight));
                    let change = (lineHeight - item['transform'][5]);
                    lineHeights.push(change);
                    lineHeight = item['transform'][5];
                    sum += change;
                    i = i + 1;
                } 
                // else {
                //     lineHeight = item['transform'][5];
                // }
            }
        }
        lineHeights.sort((a, b) => b - a);
        if (lineHeights.length > 20) {
            lineHeights.splice(0, 5);
            lineHeights.splice(-5, 5);
        } else if (lineHeights.length > 10) {
            lineHeights.splice(0, 2);
            lineHeights.splice(-2, 2);
        }
        let sum2 = lineHeights.reduce((a, b) => a + b, 0);
        let average = sum2 / lineHeights.length;
        console.log('lineHeights', lineHeights, average);
        return average;
    }


}

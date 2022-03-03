import { Injectable } from '@angular/core';
import { AngularEpubViewerComponent } from 'angular-epub-viewer';

declare var EPUBJS: any;

@Injectable()
export class EpubService {

    pages: any[] = [];
    location;
    toc: any[] = [];
    epubViewer: AngularEpubViewerComponent;
    searchQuery: string;
    searching = false;
    searchInProgress = false;
    searchResults;
    fontSize = 16;

    constructor() {

    }

    init(epubViewer: AngularEpubViewerComponent, doublePage: boolean) {
        this.pages = [];
        this.location = null;
        this.searchInProgress = false;
        this.toc = [];
        this.searchResults = [];
        this.epubViewer = epubViewer;
        if (!this.epubViewer.epub) {
            return false;
        }
        this.setFontSize();
        if (doublePage) {
            this.setDoublePage();
        } else {
            this.setSinglePage();
        }
    }

    private setFontSize() {
        if (!this.epubViewer.epub) {
            return false;
        }
        this.epubViewer.epub.setStyle('font-size', this.fontSize + 'px');
    }

    setSinglePage() {
        if (!this.epubViewer.epub) {
            return false;
        }
        // this.epubViewer.epub.setMinSpreadWidth(10000);
        this.epubViewer.epub.forceSingle(true);
        this.epubViewer.epub.setStyle('max-width', '700px');
        this.epubViewer.epub.setStyle('margin-left', 'auto');
        this.epubViewer.epub.setStyle('margin-right', 'auto');
    }

    setDoublePage() {
        if (!this.epubViewer.epub) {
            return false;
        }
        // this.epubViewer.epub.setMinSpreadWidth(500);
        this.epubViewer.epub.forceSingle(false);
        this.epubViewer.epub.setStyle('max-width', 'auto');
        this.epubViewer.epub.setStyle('margin-left', '0');
        this.epubViewer.epub.setStyle('margin-right', '0');
    }

    zoomIn() {
        if (this.fontSize >= 36) {
            return;
        }        
        this.fontSize += 4;
        this.setFontSize();
        this.epubViewer.computePagination();
    }

    zoomOut() {
        if (this.fontSize <= 8) {
            return;
        }
        this.fontSize -= 4;
        this.setFontSize();
        this.epubViewer.computePagination();
    }

    getCfiFromHref(href)  {
        const id = href.split('#')[1];
        const book = this.epubViewer.epub;
        console.log('spine', book.spine);
        const item = book.spine.get(href)
        item.load(book.load.bind(book))
        const el = id ? item.document.getElementById(id) : item.document.body
        return item.cfiFromElement(el)
    }

    onSearch() {
        if (this.searchInProgress) {
            return;
        }
        if (!this.searchQuery) {
            this.cleanQuery();
        }
        this.searchInProgress = true;
        const context = this;
        // console.log('onSearch', this.searchQuery);

        const q = this.searchQuery;
        const book = this.epubViewer.epub;

        var resultPromises = [];

        for (var i = 0; i < book.spine.length; i++) {
        var spineItem = book.spine[i];
        resultPromises.push(new Promise(function(resolve, reject) {
            new Promise(function(resolve, reject) {
            resolve(new EPUBJS.Chapter(spineItem, book.store, book.credentials));
            }).then(function(chapter: any) {
            return new Promise(function(resolve, reject) {
                chapter.load().then(function() {
                resolve(chapter);
                }).catch(reject);
            });
            }).then(function(chapter: any) {
                console.log('chapter', chapter);
            return Promise.resolve(chapter.find(q));
            }).then(function(result) {
            resolve(result);
            });
        }));
        }
        Promise.all(resultPromises).then(function(results) {
        return new Promise(function(resolve, reject) {
            resolve(results);
            var mergedResults = [].concat.apply([], results);
            context.onSearchFinished(mergedResults);
        });
        });

    }

    onSearchFinished(results) {
        this.searching = true;
        this.searchInProgress = false;
        this.searchResults = [];
        for (const r of results) {
            this.searchResults.push({
                cfi: r.cfi,
                snippet: r.excerpt.replaceAll(this.searchQuery, `<b>${this.searchQuery}</b>`)
            });
        }
    }

    cleanQuery() {
        if (this.searchInProgress) {
            return;
        }
        this.searchQuery = "";
        this.searchResults = [];
        this.searching = false;
    }

    onTOCLoaded(toc) {
        this.toc = toc;
        console.log('toc', toc);
    }

    goToNext() {
        this.epubViewer.nextPage();
    }    

    goToPrevious() {
        this.epubViewer.previousPage();
    }   


//     cfi: "epubcfi(/6/18[Kapit_02.xhtml])"
// href: "Text/Kapit_02.xhtml"

// cfi: "epubcfi(/6/18[Kapit_02.xhtml#_idParaDest-11])"
// href: "Text/Kapit_02.xhtml#_idParaDest-11"

//     //http://localhost:4200/mzk/view/OEBPS/Text/Kapit_02.xhtml#_idParaDest-11
    goToChapter(chapter: any) {

    

        console.log('goToChapter', chapter);
        const book = this.epubViewer.epub;
        const context = this;
        var epubcfi = new EPUBJS.EpubCFI();
        epubcfi.generateCfiFromHref(chapter.href, book).then(function(cfi){
            console.log('--cfi', cfi);
            context.epubViewer.goTo(cfi);

        });

        // // console.log(chapter.href = " -> " + this.getCfiFromHref(chapter.href));
        // const spine = book.spine;//.get(chapter.href);
        // console.log('spine', spine);
        // console.log('book.navigation.get', book.navigation.get(chapter.href));
        // // chapter.cfi = "epubcfi(/6/18[Kapit_02.xhtml#_idParaDest-23])";
        // this.epubViewer.goTo(chapter.href);
    }

    goToSnippet(snippet: any) {
        this.epubViewer.goTo(snippet.cfi);
    }

    totalPages(): number {
        return this.pages.length;
    }

    goToPage(index: number) {
        if (index < 1 || index > this.pages.length) {
            return;
        }
        // console.log('go to index', index);
        this.epubViewer.goTo(this.pages[index - 1].cfi);
        // this.epubViewer.goto
    }

    openFile(file) {
        this.epubViewer.openFile(file);
    }
    
    onLocationFound(location: any) {
        this.location = location;
        console.log('=====', location);
        // console.log('onLocationFound', location);
    }

    isChapterSelected(chapter): boolean {
        if (!this.location || !this.location.chapter) {
            return false;
        }
        return this.location.chapter.spinePos == chapter.spinePos;
    }

    onPaginationComputed(pages: any) {
        // console.log('onPaginationComputed', pages);
        this.pages = pages;
        // console.log('onPaginationComputed - loca', this.epubViewer.currentLocation);
    }

}

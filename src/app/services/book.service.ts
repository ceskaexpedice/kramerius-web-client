import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { KrameriusApiService } from './kramerius-api.service';
import { Page } from './../model/page.model';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';


@Injectable()
export class BookService {

    private uuid;
    private subject = new Subject<Page>();

    private activePageIndex = 0;
    public pages: Page[] = [];

    constructor(private location: Location, private krameriusApiService: KrameriusApiService, private router: Router, private route: ActivatedRoute) {

    }

    // public leftPage: Page;
    // public rightPage: Page;

    init(uuid: string, data: any[], pageUuid: string) {
        this.uuid = uuid;
        let index = 0;
        let currentPage = 0;
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
                    page.number = details['pagenumber'];
                }
                if (!page.number) {
                    page.number = p['title'];
                }
                page.index = index;
                index += 1;
                page.thumb = this.krameriusApiService.getThumbUrl(page.uuid);
                this.pages.push(page);
            }
        });
        this.goToPageOnIndex(currentPage);
    }

    getPage() {
        return this.pages[this.activePageIndex];
    }


    watchPage(): Observable<Page> {
        return this.subject.asObservable();
    }

    goToPage(page: Page) {
        this.goToPageOnIndex(page.index);
    }

    goToPageOnIndex(index: number) {
        this.activePageIndex = index;

        const page = this.getPage();

        this.location.go('/view/' + this.uuid, 'page=' + page.uuid);

        if (!page.hasImageData()) {
            const url = this.krameriusApiService.getZoomifyRootUrl(page.uuid);
            this.krameriusApiService.getZoomifyProperties(page.uuid).subscribe(response => {
              if (!response) {
                return;
              }
              const a = response.toLowerCase().split('"');
              const width = parseInt(a[1], 10);
              const height = parseInt(a[3], 10);
              page.setImageProperties(width, height, url);
              this.subject.next(page);
            });
        } else {
            this.subject.next(page  );
        }
    }

    clear() {
        // this.leftPage = null;
        // this.rightPage = null;
        this.pages = [];
    }


}

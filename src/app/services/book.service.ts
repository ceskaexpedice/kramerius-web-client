import { Page } from './../model/page.model';
import { Injectable } from '@angular/core';


@Injectable()
export class BookService {

    public children: any[] = [];

     public leftPage: Page = new Page(2056, 2775, 'https://kramerius.mzk.cz/search/zoomify/uuid:5de8741e-3f83-49f8-b7a6-274e1f49603b/');
     public rightPage: Page = new Page(2149, 2774, 'https://kramerius.mzk.cz/search/zoomify/uuid:ce36d3a4-fd97-4439-9bff-8524a6010be7/');

    setChildren(children: any[]) {
        this.children = children;
    }


}

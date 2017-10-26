import { SearchQuery } from './../search_query.model';
import { SearchService } from './../../services/search.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search-pagination',
  templateUrl: './search-pagination.component.html',
  styleUrls: ['./search-pagination.component.scss']
})
export class SearchPaginationComponent implements OnInit {

  constructor(public searchService: SearchService) {
  }

  ngOnInit() {
  }


  numberOfPages() {
    const step = this.searchService.query.getRows();
    return Math.ceil(this.searchService.getNumberOfResults() / step);
  }


  pages() {
    const numberOfPages = this.numberOfPages();
    const page = this.searchService.query.page;
    const pages = [];
    pages.push(1);
    for (let i = page - 5; i <= page + 5; i++) {
      if (i > 1 && i <= numberOfPages) {
        pages.push(i);
      }
    }
    if (numberOfPages > page + 5) {
      pages.push(numberOfPages);
    }
    return pages;
  }

  hasNext() {
    const numberOfPages = this.numberOfPages();
    const page = this.searchService.query.page;
    return page < numberOfPages;
  }

  hasPrevious() {
    const page = this.searchService.query.page;
    return page > 1;
  }

}

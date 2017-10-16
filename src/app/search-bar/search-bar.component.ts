import { LibrarySearchService } from './../services/library-search.service';
import { Router } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
import { Translator } from 'angular-translator'

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {

  @Input() autocomplete;
  @Input() input;

  searchStr;

  constructor(public translator: Translator,
    public router: Router,
    public service: LibrarySearchService) {
  }

  ngOnInit() {
  }

  onSelected(event) {
    if (event) {
      const uuid = event['originalObject']['PID'];
      const title = event['title'];
      this.router.navigate(['/search'], { queryParams: { q: title } });
    }
  }

  cleanQuery() {
    this.searchStr = '';
  }

  onLanguageChanged(lang: string) {
    localStorage.setItem('lang', lang);
    this.translator.language = lang;
  }

  onKeyUp(event) {
    if (event.keyCode === 13) {
      this.search();
    }
  }

  search() {
    let q = this.searchStr;
    if (q == null) {
      q = '';
    }
    this.router.navigate(['/search'], { queryParams: { q: q } });
  }

}

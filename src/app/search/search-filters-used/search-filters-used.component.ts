import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search-filters-used',
  templateUrl: './search-filters-used.component.html',
  styleUrls: ['./search-filters-used.component.scss']
})
export class SearchFiltersUsedComponent implements OnInit {
  
  // --- PRO TESTOVANI, POTOM VYMAZAT --- !!!!
 facetsUsed = [
   {id: 1, title: "Aktini filtr delsi test"},
   {id: 2, title: "Babicka"},
   {id: 3, title: "Dedecek"},
   {id: 4, title: "Bozena Nemcova"}
 ]
 // --- PRO TESTOVANI, POTOM VYMAZAT --- !!!!


  constructor() { }

  ngOnInit() {
  }

}

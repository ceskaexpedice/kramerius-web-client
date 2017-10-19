import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search-toolbar',
  templateUrl: './search-toolbar.component.html',
  styleUrls: ['./search-toolbar.component.scss']
})
export class SearchToolbarComponent implements OnInit {
  
  // --- PRO TESTOVANI, POTOM VYMAZAT --- !!!!
 doctype = [
   {id: 1, title: "Knihy", type: "monograph", count: "117614", "active": true},
   {id: 2, title: "Novinky a časopisy", type: "periodical", count: "3576"},
   {id: 3, title: "Audio", type: "soundrecording", count: "2224", "active": true},
   {id: 4, title: "Mapy", type: "map", count: "1008"},
   {id: 5, title: "Grafika", type: "graphic", count: "610"},
   {id: 6, title: "Hudebniny", type: "sheetmusic", count: "549", "active": true},
   {id: 7, title: "Archiválie", type: "archive", count: "297"},
   {id: 8, title: "Rukopisy", type: "manuscript", count: "103"}
 ]
 // --- PRO TESTOVANI, POTOM VYMAZAT --- !!!!

  constructor() { }

  ngOnInit() {
  }

}

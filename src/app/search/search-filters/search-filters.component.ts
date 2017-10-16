import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search-filters',
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.scss']
})
export class SearchFiltersComponent implements OnInit {
  
  // --- PRO TESTOVANI, POTOM VYMAZAT --- !!!!
 facets = [
   {id: 1, title: "Dostupnost",
     items: [
       {item: "Pouze neveřejné", count: "298"},
       {item: "Pouze veřejné", count: "189"}
     ]
   },
   {id: 2, title: "Klíčové slovo",
     items: [
       {item: "Dějiny", count: "398"},
       {item: "Vlastivěda", count: "298"},
       {item: "History", count: "187"},
       {item: "Sebepoznání", count: "129"},
       {item: "Posmrtný život", count: "111"},
       {item: "Životní moudrost", count: "90"},
       {item: "Historie", count: "88"},
       {item: "Katolické motlitby", count: "76"},
       {item: "Rozvoj myšlení", count: "20"},
       {item: "Výtvarné práce", count: "18"},
       {item: "Kuriozity, rekordy a zajímavosti", count: "2"}
     ]
   },
   {id: 3, title: "Autor",
     items: [
       {item: "Item 1", count: "333"},
       {item: "Item 2", count: "234"},
       {item: "Item 3", count: "2"}
     ]
   },
   /*{id: 4, title: "Jazyk",
     items: [
       {item: "Item 1", count: "234"},
       {item: "Item 2", count: "33"},
       {item: "Item 3", count: "1"}
     ]
   },
   {id: 5, title: "Sbírky",
     items: [
       {item: "Item 1", count: "190"},
       {item: "Item 2", count: "23"},
       {item: "Item 3", count: "16"}
     ]
   }*/
 ]
 // --- PRO TESTOVANI, POTOM VYMAZAT --- !!!!

  constructor() { }

  ngOnInit() {
  }

}

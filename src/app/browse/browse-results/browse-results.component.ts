import { AppSettings } from './../../services/app-settings';
import { BrowseService } from './../../services/browse.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-browse-results',
  templateUrl: './browse-results.component.html'
})
export class BrowseResultsComponent implements OnInit {

  constructor(public browseService: BrowseService, public appSettings: AppSettings) {
  }

  ngOnInit() {
  }

  //test na HTML entity - kvuli chybnemu zobrazovani
   containsHTMLEntities(text): boolean {
      if(text.match(/&lt;/g)) { return true; }
      else if(text.match(/&gt;/g)) { return true; }
      else if(text.match(/&quot;/g)) { return true; }
      else if(text.match(/&apos;/g)) { return true; }
      else { return false; }
   }

  getParams(value: string) {
    const params = {};
    params[this.browseService.query.category] = value;
    return params;
  }

}

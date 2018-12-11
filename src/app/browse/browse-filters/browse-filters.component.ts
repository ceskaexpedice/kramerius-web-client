import { BrowseService } from './../../services/browse.service';
import { Component, OnInit, Input } from '@angular/core';
import { AppSettings } from '../../services/app-settings';

@Component({
  selector: 'app-browse-filters',
  templateUrl: './browse-filters.component.html',
  styleUrls: ['./browse-filters.component.scss']
})
export class BrowseFiltersComponent implements OnInit {
  @Input() collapsedFilter: boolean;

  filters: string[];
  accessibilityEnabled = false;

  constructor(public browseService: BrowseService, private appSettings: AppSettings) {
  }

  ngOnInit() {
    this.filters = [];
    for (const f of this.appSettings.filters) {
      if (f === 'accessibility') {
        this.accessibilityEnabled = true;
      } else {
        this.filters.push(f);
      }
    }
  }

}

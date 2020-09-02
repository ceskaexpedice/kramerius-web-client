import { AppSettings } from './../services/app-settings';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AnalyticsService } from '../services/analytics.service';
import { SearchService } from '../services/search.service';
import { AppState } from '../app.state';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss']
})
export class LogoComponent implements OnInit {

  @ViewChild('dropdown') dropdown;

  constructor(public settings: AppSettings, public state: AppState, private search: SearchService, public analytics: AnalyticsService) {
  }

  ngOnInit() {
  }

  open() {
    this.dropdown.open();
  }

  changeLibrary(kramerius) {
    this.analytics.sendEvent('home', 'kramerius', kramerius.title);
    const qp = this.search.getChangeLibraryUrlParams();
    let q = "";
    for (let p in qp) {
      q += p + "=" + qp[p] + "&";
    }
    if (q.length > 0) {
      q = q.substring(0, q.length - 1);
    }
    console.log('q', q);
    window.location.href = '/' +  kramerius.code + '/search' + '?' + q;
  }


}

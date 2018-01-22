import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { SearchService } from './../../services/search.service';
import { AppState } from './../../app.state';

@Component({
  selector: 'app-search-toolbar',
  templateUrl: './search-toolbar.component.html'
})
export class SearchToolbarComponent implements OnInit {

  constructor(public searchService: SearchService, public state: AppState) {
  }

  ngOnInit() {
  }


  // toggleElement(id) {
  //   if (id === 'app-chart-bar') {
  //     this.state.chartBarToggle();
  //     this.state.showingCalendar = false;
  //     $('#app-calendar').hide();
  //   } else if (id === 'app-calendar') {
  //     this.state.calendarToggle();
  //     this.state.showingChartBar = false;
  //     $('#app-chart-bar').hide();
  //   }
  //   $('#' + id).toggleClass('active');
  //   $('#' + id).slideToggle('fast');
  // }
  
  // hide panel - pedro
  hidePanel() {
    this.state.panelToggleResult();
  }
}

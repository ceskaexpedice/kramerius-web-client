import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-cookiebar',
  templateUrl: './cookiebar.component.html',
  styleUrls: ['./cookiebar.component.scss']
})
export class CookiebarComponent implements OnInit {
  
  functional = true;
  analytical = false;
  preferential = false;
  showDetail = false;

  constructor(private analytics: AnalyticsService) { }

  ngOnInit() {
  }

  getType() {
    return localStorage.getItem('cpref');
  }

  acceptSelected() {
    let selection = 'none';
    if (this.preferential && this.analytical) {
      selection = 'all';
    } else if (this.preferential) {
      selection = 'preferential';
    } else if (this.analytical) {
      selection = 'analytical';
    } 
    localStorage.setItem('cpref', selection);
    this.analytics.sendEvent('cookiebar', 'accept', 'selection-' + selection);
    this.reload();
  }

  acceptAll() {
    this.analytics.sendEvent('cookiebar', 'accept', 'all');
    localStorage.setItem('cpref', "all");
    this.reload();
  }

  rejectAll() {
    this.analytics.sendEvent('cookiebar', 'accept', 'none');
    localStorage.setItem('cpref', "none");
    this.reload();
  }

  reload() {
    window.location.reload();
  }

  showDetails() {
    this.analytics.sendEvent('cookiebar', 'action', 'showDetails');
    this.showDetail = true;
  }

  hideDetails() {
    this.analytics.sendEvent('cookiebar', 'action', 'hideDetails');
    this.showDetail = false;
  }

}

import { Component, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit() {
  }

  getType() {
    return localStorage.getItem('cpref');
  }

  acceptSelected() {
    if (this.preferential && this.analytical) {
      localStorage.setItem('cpref', "all");
    } else if (this.preferential) {
      localStorage.setItem('cpref', "preferential");
    } else if (this.analytical) {
      localStorage.setItem('cpref', "analytical");
    } else {
      localStorage.setItem('cpref', "none");
    }
    this.reload();
  }

  acceptAll() {
    localStorage.setItem('cpref', "all");
    this.reload();
  }

  rejectAll() {
    localStorage.setItem('cpref', "none");
    this.reload();
  }

  reload() {
    window.location.reload();
  }

}

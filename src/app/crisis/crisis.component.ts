import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crisis',
  templateUrl: './crisis.component.html',
  styleUrls: ['./crisis.component.scss']

})
export class CrisisComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  approve() {
    localStorage.setItem("crisis_approved", "yes");
    const url = localStorage.getItem("crisis_url") || '/';
    this.router.navigateByUrl(url);
  }

}

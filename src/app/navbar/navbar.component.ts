import { LibrarySearchService } from './../services/library-search.service';
import { Router } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  @Input() autocomplete;
  @Input() input;

  searchStr;

  constructor(public router: Router,
    public service: LibrarySearchService) {
  }

  ngOnInit() {
  }

  onSelected(event) {
    console.log('onSelected', event);
    if (event) {
      const uuid = event['originalObject']['PID'];
      this.router.navigate(['/documents/' + uuid]);
    }
    // console.log("onSelected", event['originalObject']['PID']);
    // console.log("onSelected", this.searchStr);
  }

  onEnter() {
  }


}

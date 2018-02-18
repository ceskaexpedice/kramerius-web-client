import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html'
})
export class LogoComponent implements OnInit {

  logo;
  title;

  constructor() {
    this.title = environment.title;
    this.logo = environment.logo;
  }

  ngOnInit() {
  }

}

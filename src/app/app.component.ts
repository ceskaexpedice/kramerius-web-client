import { Component } from '@angular/core';
import { Translator } from 'angular-translator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private translator: Translator) {
    const lang = localStorage.getItem('lang');
    if (lang) {
      this.translator.language = lang;
    }
  }

}

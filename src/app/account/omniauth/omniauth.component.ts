import { AccountService } from './../../services/account.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  templateUrl: './omniauth.component.html'
})
export class OmniauthComponent implements OnInit {


  constructor(private router: Router,
    private account: AccountService) {}


  ngOnInit() {
    this.account.processOAuthCallback((success) => {
      if (success) {
        this.router.navigate(['/']);
      }
    });
  }

}

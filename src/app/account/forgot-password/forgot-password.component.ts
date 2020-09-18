import { AccountService } from '../../services/account.service';
import { Component, OnInit } from '@angular/core';
import { AppSettings } from '../../services/app-settings';
import { Router } from '@angular/router';

@Component({
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  email: string;
  message: string;

  state: string; // none | loading | failure

  constructor(private router: Router,
              private account: AccountService,
              private appSettings: AppSettings) { }

  ngOnInit() {
    if (!this.account.serviceEnabled()) {
      this.router.navigate(['/']);
      return;
    }
    this.state = 'none';
  }

  login() {
    this.state = 'loading';
    if (!this.email) {
      this.message = 'Zadejte prosím e-mailovou adresu';
      this.state = 'failure';
      return;
    }
    this.account.resetPassword(this.email, (success: boolean) => {
      if (success) {
        this.state = 'success';
      } else {
        this.message = 'Požadavek se nezdařil';
        this.state = 'failure';
      }
    });
  }
}

import { AccountService } from './../../services/account.service';
import { Component, OnInit } from '@angular/core';
import { AppSettings } from '../../services/app-settings';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html'
})
export class SigninComponent implements OnInit {

  email: string;
  password: string;

  state: string; // none | loading | failure

  constructor(private router: Router,
              private account: AccountService,
              private appSettings: AppSettings) { }

  ngOnInit() {
    this.state = 'none';
  }

  login() {
    if (!this.appSettings.loginEnabled) {
      this.router.navigate(['/']);
      return;
    }
    this.account.login(this.email, this.password, (success: boolean) => {
      if (success) {
        this.router.navigate(['/']);
      } else {
        this.state = 'failure';
      }
    });
  }
}

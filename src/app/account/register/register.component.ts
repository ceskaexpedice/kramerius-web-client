
import { AccountService } from '../../services/account.service';
import { Component, OnInit } from '@angular/core';
import { AppSettings } from '../../services/app-settings';
import { Router } from '@angular/router';

@Component({
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  message: string;

  state: string; // none | loading | failure | success

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

  register() {
    this.state = 'loading';
    if (!this.email) {
      this.message = 'Zadejte prosím e-mailovou adresu';
      this.state = 'failure';
      return;
    }
    if (!this.password) {
      this.message = 'Zadejte prosím heslo';
      this.state = 'failure';
      return;
    }
    if (this.password !== this.passwordConfirmation) {
      this.message = 'Heslo se neshoduje s potvrzením hesla';
      this.state = 'failure';
      return;
    }
    this.account.register(this.name, this.email, this.password, this.passwordConfirmation, (success: boolean) => {
      if (success) {
        this.state = 'success';
      } else {
        this.message = 'Vytvoření účtu se nezdařilo';
        this.state = 'failure';
      }
    });
  }
}

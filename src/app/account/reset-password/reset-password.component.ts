
import { AccountService } from '../../services/account.service';
import { Component, OnInit } from '@angular/core';
import { AppSettings } from '../../services/app-settings';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  uid: string;
  clientId: string;
  token: string;
  password: string;
  passwordConfirmation: string;
  message: string;

  state: string; // none | loading | failure

  constructor(private router: Router,
              private route: ActivatedRoute,
              private account: AccountService,
              private appSettings: AppSettings) { }

  ngOnInit() {
    if (!this.appSettings.loginEnabled) {
      this.router.navigate(['/']);
      return;
    }
    this.route.queryParamMap.subscribe(params => {
      this.uid = params.get('uid');
      this.clientId = params.get('client_id');
      this.token = params.get('token');
    });
    this.state = 'none';
  }

  submit() {
    this.state = 'loading';
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
    this.account.activateAccount(this.uid, this.token, this.clientId, this.password, this.passwordConfirmation, (success: boolean) => {
      if (success) {
        this.router.navigate(['/']);
      } else {
        this.message = 'Obnova hesla se nezdařila';
        this.state = 'failure';
      }
    });
  }
}

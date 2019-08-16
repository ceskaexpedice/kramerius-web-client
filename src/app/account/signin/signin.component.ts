import { AccountService } from './../../services/account.service';
import { Component, OnInit } from '@angular/core';
import { AppSettings } from '../../services/app-settings';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

  email: string;
  password: string;
  errorMessage: string;
  welcomeMessage: string;
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
    this.route.queryParams.subscribe(params => {
      if (params['account_confirmation_success'] === 'true') {
        this.welcomeMessage = 'Registrace byla úspěšně dokončena. Nyní se můžete přihlásit.';
      } else if (params['password_reset_success'] === 'true') {
        this.welcomeMessage = 'Heslo bylo úspěšně změněno. Nyní se můžete přihlásit.';
      }
    });
    this.state = 'none';
  }

  login() {
    if (!this.email) {
      this.errorMessage = 'Zadejte prosím e-mailovou adresu';
      this.state = 'failure';
      return;
    }
    if (!this.password) {
      this.errorMessage = 'Zadejte prosím heslo';
      this.state = 'failure';
      return;
    }
    this.state = 'loading';
    this.account.login(this.email, this.password, (success: boolean) => {
      if (success) {
        this.router.navigate(['/']);
      } else {
        this.errorMessage = 'Přihlášení se nezdařilo';
        this.state = 'failure';
      }
    });
  }

  loginWithGoogle() {
    this.account.signInOAuth('google', () => {
      console.log('after loginWithGoogle');
    });
  }

  loginWithFacebook() {
    this.account.signInOAuth('facebook', () => {
      console.log('after loginWithFacebook');
    });
  }

}

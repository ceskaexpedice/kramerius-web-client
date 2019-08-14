import { CloudAuthService } from './../services/cloud-auth.service';
import { AuthService } from './../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { User } from '../model/user.model';
import { Router } from '@angular/router';
import { AppSettings } from '../services/app-settings';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  // username: string = 'krameriusAdmin';
  // password: string = 'Mufloni1.';
  // username: string = 'dnntuser';
  // password: string = 'p7MvZ1Rs';
  username: string;
  password: string;

  state: string; // none | loading | failure

  constructor(private authService: AuthService,
              public router: Router,
              private appSettings: AppSettings,
              private cloudAuth: CloudAuthService) { }

  ngOnInit() {
    this.state = 'none';
  }

  login() {
    if (this.appSettings.dnntEnabled) {
      this.authService.login(this.username, this.password).subscribe(
        (user: User) => {
          console.log('user', user);
          if (user) {
            this.router.navigate(['/']);
          } else {
            this.state = 'failure';
          }
        }
      );
    } else if (this.appSettings.loginEnabled) {
      this.cloudAuth.login(this.username, this.password).subscribe(
        res => {
          console.log('login success', res);
          console.log(this.cloudAuth.userData());
        }, error => {
          console.log('login failure', error);
        }
      );
    }
  }
}

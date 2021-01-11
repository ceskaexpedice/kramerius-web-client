import { AuthService } from '../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { User } from '../model/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  
  username: string;
  password: string;

  state: string; // none | loading | failure

  constructor(private authService: AuthService,
              public router: Router) { }

  ngOnInit() {
    this.state = 'none';
  }

  login() {
    this.authService.login(this.username, this.password, (user: User) => {
        if (user) {
          if (this.authService.redirectUrl) {
            window.open(this.authService.redirectUrl, '_top');
          } else {
            this.router.navigate(['/']);
          }
        } else {
          this.state = 'failure';
        }
      }
    );
  }

}

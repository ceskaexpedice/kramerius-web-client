import { AuthService } from '../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  
  username: string;
  password: string;
  message: string;
  state: string; // none | loading | failure

  constructor(private auth: AuthService,
              public router: Router) { }

  ngOnInit() {
    this.state = 'none';
  }

  login() {
    this.auth.login(this.username, this.password, (status: string) => {
        if (status == 'ok') {
          if (this.auth.redirectUrl) {
            this.router.navigateByUrl(this.auth.redirectUrl);
          } else {
            this.router.navigate(['/']);
          }
        } else {
          this.message = status;
          this.state = 'failure';
        }
      }
    );
  }

}

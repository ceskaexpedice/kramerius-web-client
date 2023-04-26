import { AuthService } from '../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit {

  constructor(private auth: AuthService,
              private route: ActivatedRoute,
              public router: Router) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const sessionState = params.get('session_state');
      const code = params.get('code');
      const target = localStorage.getItem('login.url') || '/';
      localStorage.removeItem('login.url');
      console.log('sessionState', sessionState);
      console.log('code', code);
      console.log('target', target);
      this.auth.getToken(code, () => {
        this.router.navigateByUrl(target);
      });
    });
  }

}

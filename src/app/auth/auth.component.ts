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
      const code = params.get('code');
      if (code) {
        const target = localStorage.getItem('login.url') || '/';
        localStorage.removeItem('login.url');
        this.auth.getToken(code, () => {
          this.router.navigateByUrl(target);
        });
      } else {
        const target = localStorage.getItem('logout.url') || '/';
        localStorage.removeItem('logout.url');
        this.router.navigateByUrl(target);
      }
    });
  }




}

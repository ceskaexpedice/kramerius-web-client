import { AuthService } from '../services/auth.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from '../services/local-storage.service';
import { KrameriusApiService } from '../services/kramerius-api.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit {

  constructor(private auth: AuthService,
    private api: KrameriusApiService,
              private route: ActivatedRoute,
              private locals: LocalStorageService,
              public router: Router) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const sessionState = params.get('session_state');
      const code = params.get('code');
      const target = this.locals.getProperty('login.url') || '/';
      this.locals.setProperty('login.url', '/');
      console.log('sessionState', sessionState);
      console.log('code', code);
      console.log('target', target);
      this.auth.keycloakAuth(code, () => {
        this.router.navigateByUrl(target);
      });
    });
  }

}

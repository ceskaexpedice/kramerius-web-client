import { ForgotPasswordComponent } from './account/forgot-password/forgot-password.component';
import { FavouritesComponent } from './favourites/favourites.component';
import { AboutComponent } from './about/about.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { BookComponent } from './book/book.component';
import { PersistentLinkComponent } from './persistent-link/persistent-link.component';
import { MusicComponent } from './music/music.component';
import { SearchComponent } from './search/search.component';
import { BrowseComponent } from './browse/browse.component';
import { HomeComponent } from './home/home.component';
import { CollectionsComponent } from './collections/collections.component';
import { PeriodicalComponent } from './periodical/periodical.component';
import { RoutingGuardService } from './guards/routing.guard';
import { RoutingPrefixGuardService } from './guards/routing-prefix.guard';
import { NotFoundComponent } from './not-found/not-found.component';
import { LoginComponent } from './login/login.component';
import { SigninComponent } from './account/signin/signin.component';
import { RegisterComponent } from './account/register/register.component';
import { ResetPasswordComponent } from './account/reset-password/reset-password.component';
import { OmniauthComponent } from './account/omniauth/omniauth.component';
import { LandingComponent } from './landing/landing.component';
import { FaqComponent } from './faq/faq.component';
//import { CrisisComponent } from './crisis/crisis.component';

const ROUTES: Routes = [
  //  { path: 'podminky-zpristupneni', component: CrisisComponent},
    { path: '404', component: NotFoundComponent},
    //{ path: '', component: HomeComponent, canActivate: [ RoutingGuardService ] },
    { path: '', component: LandingComponent },
    { path: 'about', component: AboutComponent, canActivate: [ RoutingGuardService ] },
    { path: 'faq', component: FaqComponent, canActivate: [ RoutingGuardService ] },
    { path: 'login', component: LoginComponent, canActivate: [ RoutingGuardService ] },
    { path: 'register', component: RegisterComponent, canActivate: [ RoutingGuardService ] },
    { path: 'signin', component: SigninComponent, canActivate: [ RoutingGuardService ] },
    { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [ RoutingGuardService ] },
    { path: 'reset-password', component: ResetPasswordComponent, canActivate: [ RoutingGuardService ] },
    { path: 'omniauth', component: OmniauthComponent, canActivate: [ RoutingGuardService ] },
    { path: 'browse', component: BrowseComponent, canActivate: [ RoutingGuardService ] },
    { path: 'search', component: SearchComponent, canActivate: [ RoutingGuardService ] },
    { path: 'favourites', component: FavouritesComponent, canActivate: [ RoutingGuardService ] },
    { path: 'collections', component: CollectionsComponent, canActivate: [ RoutingGuardService ] },
    { path: 'periodical/:uuid', component: PeriodicalComponent, data: { reuse: true }, canActivate: [ RoutingGuardService ] },
    { path: 'music/:uuid', component: MusicComponent, canActivate: [ RoutingGuardService ] },
    { path: 'uuid/:uuid', component: PersistentLinkComponent, canActivate: [ RoutingGuardService ] },
    { path: 'view/:uuid', component: BookComponent, canActivate: [ RoutingGuardService ] },
    { path: 'view', component: BookComponent, canActivate: [ RoutingGuardService ] },
    { path: ':k/about', component: AboutComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/faq', component: FaqComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/login', component: LoginComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/register', component: RegisterComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/signin', component: SigninComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/forgot-password', component: ForgotPasswordComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/reset-password', component: ResetPasswordComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/omniauth', component: OmniauthComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/browse', component: BrowseComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/search', component: SearchComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/favourites', component: FavouritesComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/collections', component: CollectionsComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/periodical/:uuid', component: PeriodicalComponent, data: { reuse: true }, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/music/:uuid', component: MusicComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/uuid/:uuid', component: PersistentLinkComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/view/:uuid', component: BookComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/view', component: BookComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k', component: HomeComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/', component: HomeComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: '**', component: NotFoundComponent},

  ];


@NgModule({
  imports: [RouterModule.forRoot(ROUTES)],
  exports: [RouterModule],
  providers: [RoutingGuardService, RoutingPrefixGuardService]
})

export class AppRoutingModule {
}

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
import { LandingComponent } from './landing/landing.component';
import { StaticPageComponent } from './static-page/static-page.component';
import { SignpostHelpComponent } from './signpost/help/help.component';
import { AuthComponent } from './auth/auth.component';
import { MapSeriesComponent } from './map/series/map-series.component';

const ROUTES: Routes = [
    { path: '404', component: NotFoundComponent},
    { path: '', component: LandingComponent },
    { path: 'keycloak', component: AuthComponent },
    { path: 'help', component: SignpostHelpComponent },
    { path: 'about', component: StaticPageComponent, canActivate: [ RoutingGuardService ], data: { page: 'about' } },
    { path: 'faq', component: StaticPageComponent, canActivate: [ RoutingGuardService ], data: { page: 'faq' } },
    { path: 'terms', component: StaticPageComponent, canActivate: [ RoutingGuardService ], data: { page: 'terms' } },
    { path: 'impressum', component: StaticPageComponent, canActivate: [ RoutingGuardService ], data: { page: 'impressum' } },
    { path: 'login', component: LoginComponent, canActivate: [ RoutingGuardService ] },
    { path: 'browse', component: BrowseComponent, canActivate: [ RoutingGuardService ] },
    { path: 'search', component: SearchComponent, canActivate: [ RoutingGuardService ] },
    { path: 'collections', component: CollectionsComponent, canActivate: [ RoutingGuardService ] },
    { path: 'mapseries/:uuid', component: MapSeriesComponent, canActivate: [ RoutingGuardService ] },
    { path: 'mapseries', component: MapSeriesComponent, canActivate: [ RoutingGuardService ] },
    { path: 'periodical/:uuid', component: PeriodicalComponent, data: { reuse: true }, canActivate: [ RoutingGuardService ] },
    { path: 'collection/:collection_uuid', component: SearchComponent, canActivate: [ RoutingGuardService ] },
    { path: 'music/:uuid', component: MusicComponent, canActivate: [ RoutingGuardService ] },
    { path: 'uuid/:uuid', component: PersistentLinkComponent, canActivate: [ RoutingGuardService ] },
    { path: 'view/:uuid', component: BookComponent, canActivate: [ RoutingGuardService ] },
    { path: 'view', component: BookComponent, canActivate: [ RoutingGuardService ] },
    { path: ':k/keycloak', component: AuthComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/about', component: StaticPageComponent, canActivate: [ RoutingPrefixGuardService ], data: { page: 'about' } },
    { path: ':k/faq', component: StaticPageComponent, canActivate: [ RoutingPrefixGuardService ], data: { page: 'faq' } },
    { path: ':k/terms', component: StaticPageComponent, canActivate: [ RoutingPrefixGuardService ], data: { page: 'terms' } },
    { path: ':k/impressum', component: StaticPageComponent, canActivate: [ RoutingPrefixGuardService ], data: { page: 'impressum' } },
    { path: ':k/login', component: LoginComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/browse', component: BrowseComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/search', component: SearchComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/collections', component: CollectionsComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/mapseries/:uuid', component: MapSeriesComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/mapseries', component: MapSeriesComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/periodical/:uuid', component: PeriodicalComponent, data: { reuse: true }, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/collection/:collection_uuid', component: SearchComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/music/:uuid', component: MusicComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/uuid/:uuid', component: PersistentLinkComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/view/:uuid', component: BookComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/view', component: BookComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k', component: HomeComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: ':k/', component: HomeComponent, canActivate: [ RoutingPrefixGuardService ] },
    { path: '**', component: NotFoundComponent}
  ];


@NgModule({
  imports: [RouterModule.forRoot(ROUTES, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule],
  providers: [RoutingGuardService, RoutingPrefixGuardService]
})

export class AppRoutingModule {
}

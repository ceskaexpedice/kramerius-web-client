import { PresentationComponent } from './presentation/presentation.component';
import { DialogPdfGeneratorComponent } from './dialog/dialog-pdf-generator/dialog-pdf-generator.component';
import { ForgotPasswordComponent } from './account/forgot-password/forgot-password.component';
import { SigninComponent } from './account/signin/signin.component';
import { AccountService } from './services/account.service';
import { DialogCitationComponent } from './dialog/dialog-citation/dialog-citation.component';
import { AuthService } from './services/auth.service';
import { SimpleDialogComponent } from './dialog/simple-dialog/simple-dialog.component';
import { AppSettings } from './services/app-settings';
import { PeriodicalFulltextItemComponent } from './periodical/periodical-content/periodical-fulltext-layout/periodical-fulltext-item/periodical-fulltext-item.component';
import { PeriodicalFulltextLayoutComponent } from './periodical/periodical-content/periodical-fulltext-layout/periodical-fulltext-layout.component';
import { MusicService } from './services/music.service';
import { BookSearchComponent } from './book/book-search/book-search.component';
import { AltoService } from './services/alto-service';
import { CollectionService } from './services/collection.service';
import { HistoryService } from './services/history.service';
import { DialogShareComponent } from './dialog/dialog-share/dialog-share.component';
import { DialogPdfComponent } from './dialog/dialog-pdf/dialog-pdf.component';
import { BookControlsComponent } from './book/book-controls/book-controls.component';
import { BrowseToolbarComponent } from './browse/browse-toolbar/browse-toolbar.component';
import { AlertComponent } from './shared/alert/alert.component';
import { PaginatorComponent } from './shared/paginator/paginator.component';
import { BrowseResultsComponent } from './browse/browse-results/browse-results.component';
import { BrowseCountComponent } from './browse/browse-count/browse-count.component';
import { BrowseService } from './services/browse.service';
import { ViewerControlsService } from './services/viewer-controls.service';
import { ViewerControlsComponent } from './book/viewer/viewer-controls/viewer-controls.component';
import { SearchService } from './services/search.service';
import { LocalStorageService } from './services/local-storage.service';
import { DocumentCardComponent } from './shared/document-card/document-card.component';
import { PeriodicalCalendarLayoutComponent } from './periodical/periodical-content/periodical-calendar-layout/periodical-calendar-layout.component';
import { PeriodicalYearsItemComponent } from './periodical/periodical-content/periodical-years-layout/periodical-years-item/periodical-years-item.component';
import { PeriodicalGridItemComponent } from './periodical/periodical-content/periodical-grid-layout/periodical-grid-item/periodical-grid-item.component';
import { PeriodicalYearsLayoutComponent } from './periodical/periodical-content/periodical-years-layout/periodical-years-layout.component';
import { PeriodicalGridLayoutComponent } from './periodical/periodical-content/periodical-grid-layout/periodical-grid-layout.component';
import { PeriodicalToolbarComponent } from './periodical/periodical-content/periodical-toolbar/periodical-toolbar.component';
import { PeriodicalContentComponent } from './periodical/periodical-content/periodical-content.component';
import { SolrService } from './services/solr.service';
import { Utils } from './services/utils.service';
import { LibrarySearchService } from './services/library-search.service';
import { ModsParserService } from './services/mods-parser.service';
import { BookService } from './services/book.service';
import { KrameriusApiService } from './services/kramerius-api.service';
import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { TranslatorModule } from 'angular-translator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';


import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ViewerComponent } from './book/viewer/viewer.component';

import { BookComponent } from './book/book.component';
import { HelpComponent } from './help/help.component';
import { HomeComponent } from './home/home.component';
import { BrowseComponent } from './browse/browse.component';
import { NavigationComponent } from './book/navigation/navigation.component';
import { MetadataComponent } from './metadata/metadata.component';

import { Ng2CompleterModule } from 'ng2-completer';
import { AppState } from './app.state';
import { SearchComponent } from './search/search.component';
import { SearchResultsComponent } from './search/search-results/search-results.component';
import { SearchFiltersComponent } from './search/search-filters/search-filters.component';
import { PeriodicalComponent } from './periodical/periodical.component';
import { SearchFiltersUsedComponent } from './search/search-filters-used/search-filters-used.component';
import { SearchCountComponent } from './search/search-count/search-count.component';
import { SearchToolbarComponent } from './search/search-toolbar/search-toolbar.component';
import { HomeSearchBarComponent } from './home/home-search-bar/home-search-bar.component';
import { NavbarSearchBarComponent } from './navbar/navbar-search-bar/navbar-search-bar.component';
import { SearchChartBarComponent } from './search/search-chart-bar/search-chart-bar.component';
import { SearchCalendarComponent } from './search/search-calendar/search-calendar.component';
import { LazyLoadImageModule, intersectionObserverPreset } from 'ng-lazyload-image';
import { BrowseFiltersComponent } from './browse/browse-filters/browse-filters.component';
import { DialogOcrComponent } from './dialog/dialog-ocr/dialog-ocr.component';
import { LogoComponent } from './logo/logo.component';
import { PersistentLinkComponent } from './persistent-link/persistent-link.component';
import { PeriodicalService } from './services/periodical.service';
import { BrowseSearchComponent } from './browse/browse-search/browse-search.component';
import { MusicComponent } from './music/music.component';
import { MusicPlayerComponent } from './music/music-player/music-player.component';
import { MusicPlaylistComponent } from './music/music-player/music-playlist/music-playlist.component';
import { MusicHeaderComponent } from './music/music-player/music-header/music-header.component';
import { MusicControlsComponent } from './music/music-player/music-controls/music-controls.component';
import { BookToolbarComponent } from './book/book-toolbar/book-toolbar.component';
import { MusicToolbarComponent } from './music/music-player/music-toolbar/music-toolbar.component';

import { PdfViewerComponent } from './book/pdf-viewer/pdf-viewer.component';
import { PeriodicalCountComponent } from './periodical/periodical-filters/periodical-count/periodical-count.component';
import { PeriodicalSearchComponent } from './periodical/periodical-filters/periodical-search/periodical-search.component';
import { PeriodicalFiltersComponent } from './periodical/periodical-filters/periodical-filters.component';

import { NgxGalleryModule } from 'ngx-gallery';
import { MzButtonModule, MzInputModule, MzModalModule, MzNavbarModule, MzIconModule, MzIconMdiModule, MzTooltipModule, MzSidenavModule, MzSpinnerModule, MzBadgeModule, MzTabModule, MzCollapsibleModule, MzCollectionModule, MzCardModule, MzDropdownModule, MzCheckboxModule, MzDatepickerModule, MzToastModule } from 'ngx-materialize';
import { DialogAuthosComponent } from './dialog/dialog-authors/dialog-authors.component';
import { CollectionsComponent } from './collections/collections.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeLogoComponent } from './home-logo/home-logo.component';
import { HttpRequestCache } from './services/http-request-cache.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CachingInterceptor } from './services/caching-interceptor.service';
import { PageTitleService } from './services/page-title.service';
import { NotFoundComponent } from './not-found/not-found.component';
import { RemovePrefixPipe } from './pipes/remove-prefix.pipe';
import { UpcasePipe } from './pipes/upcase.pipe';

import { CookieService } from 'ngx-cookie-service';
import { ShareService } from './services/share.service';
import { AboutComponent } from './about/about.component';
import { AnalyticsService } from './services/analytics.service';
import { DatepickerModule } from './datepicker';
import { HomeFooterComponent } from './home/home-footer/home-footer.component';
import { KrameriusInfoService } from './services/kramerius-info.service';
import { CloudApiService } from './services/cloud-api.service';
import { AngularTokenModule } from 'angular-token';
import { environment } from '../environments/environment';
import { FavouritesComponent } from './favourites/favourites.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './account/register/register.component';
import { ResetPasswordComponent } from './account/reset-password/reset-password.component';
import { OmniauthComponent } from './account/omniauth/omniauth.component';
import { DocumentSearchService } from './services/document-search.service';

import { AgmCoreModule } from '@agm/core';


import { HighlightModule } from 'ngx-highlightjs';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import { DialogAdminMetadataComponent } from './dialog/dialog-admin-metadata/dialog-admin-metadata.component';
import { MapBrowseComponent } from './map/browse/map-browse.component';
import { CollectionComponent } from './collections/collection/collection.component';
import { IiifService } from './services/iiif.service';
import { ZoomifyService } from './services/zoomify.service';
import { LoggerService } from './services/logger.service';
import { DialogAdvancedSearchComponent } from './dialog/dialog-advanced-search/dialog-advanced-search.component';
import { DialogPolicyComponent } from './dialog/dialog-policy/dialog-policy.component';
import { LandingComponent } from './landing/landing.component';
import { LibrariesComponent } from './libraries/libraries.component';
import { FaqComponent } from './faq/faq.component';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { DialogAdminComponent } from './dialog/dialog-admin/dialog-admin.component';
import { AdminApiService } from './services/admin-api.service';
import { NavigationSnippetComponent } from './book/navigation/navigation-snippet/navigation-snippet.component';
import { NavigationItemComponent } from './book/navigation/navigation-item/navigation-item.component';



export function hljsLanguages() {
  return [
    {name: 'json', func: json},
    {name: 'xml', func: xml}
  ];
}

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    ViewerComponent,
    BookComponent,
    HelpComponent,
    AboutComponent,
    HomeComponent,
    BrowseComponent,
    NavigationComponent,
    MetadataComponent,
    NavigationItemComponent,
    NavigationSnippetComponent,
    SearchComponent,
    SearchResultsComponent,
    SearchFiltersComponent,
    DocumentCardComponent,
    PeriodicalComponent,
    PeriodicalContentComponent,
    PeriodicalToolbarComponent,
    PeriodicalGridLayoutComponent,
    PeriodicalFulltextLayoutComponent,
    PeriodicalYearsLayoutComponent,
    PeriodicalCalendarLayoutComponent,
    PeriodicalGridItemComponent,
    PeriodicalFulltextItemComponent,
    PeriodicalYearsItemComponent,
    SearchFiltersUsedComponent,
    SearchCountComponent,
    SearchToolbarComponent,
    ViewerControlsComponent,
    HomeSearchBarComponent,
    NavbarSearchBarComponent,
    SearchChartBarComponent,
    SearchCalendarComponent,
    BrowseFiltersComponent,
    BrowseCountComponent,
    BrowseResultsComponent,
    BrowseToolbarComponent,
    PaginatorComponent,
    AlertComponent,
    BookControlsComponent,
    DialogOcrComponent,
    DialogPdfComponent,
    DialogPdfGeneratorComponent,
    DialogShareComponent,
    DialogCitationComponent,
    DialogAuthosComponent,
    LogoComponent,
    HomeLogoComponent,
    BookSearchComponent,
    PersistentLinkComponent,
    BrowseSearchComponent,
    MusicComponent,
    MusicPlayerComponent,
    MusicPlaylistComponent,
    MusicHeaderComponent,
    MusicControlsComponent,
    BookToolbarComponent,
    MusicToolbarComponent,
    PdfViewerComponent,
    PeriodicalCountComponent,
    PeriodicalSearchComponent,
    PeriodicalFiltersComponent,
    SimpleDialogComponent,
    CollectionsComponent,
    CollectionComponent,
    NotFoundComponent,
    RemovePrefixPipe,
    UpcasePipe,
    AboutComponent,
    FaqComponent,
    HomeFooterComponent,
    FavouritesComponent,
    LoginComponent,
    SigninComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    OmniauthComponent,
    DialogAdminMetadataComponent,
    MapBrowseComponent,
    PresentationComponent,
    DialogAdvancedSearchComponent,
    DialogPolicyComponent,
    LandingComponent,
    LibrariesComponent,
    SafeHtmlPipe,
    DialogAdminComponent
  ],
  entryComponents: [
    DialogOcrComponent,
    DialogPdfComponent,
    DialogShareComponent,
    DialogCitationComponent,
    SimpleDialogComponent,
    DialogAuthosComponent,
    DialogPdfGeneratorComponent,
    DialogAdminMetadataComponent,
    DialogAdvancedSearchComponent,
    DialogPolicyComponent,
    DialogAdminComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    DatepickerModule,
    Ng2CompleterModule,
    LazyLoadImageModule.forRoot({
      preset: intersectionObserverPreset
    }),
    AppRoutingModule,
    NgxGalleryModule,
    TranslatorModule.forRoot({
      providedLanguages: ['en', 'cs'],
      defaultLanguage: 'cs',
      loaderOptions: {
        path: 'assets/i18n/{{language}}.json?v1.7.10'
      }
    }),
    MzButtonModule,
    MzInputModule,
    MzModalModule,
    MzNavbarModule,
    MzIconModule,
    MzIconMdiModule,
    MzTooltipModule,
    MzSidenavModule,
    MzSpinnerModule,
    MzBadgeModule,
    MzTabModule,
    MzCollapsibleModule,
    MzCollectionModule,
    MzCardModule,
    MzToastModule,
    MzDropdownModule,
    MzCheckboxModule,
    MzDatepickerModule,
    ClipboardModule,
    AngularTokenModule.forRoot({
      apiBase: environment.cloudApiBase,
      oAuthBase: environment.cloudApiBase,
      oAuthCallbackPath: 'omniauth',
      oAuthPaths: {
        google: 'auth/google_oauth2',
        facebook: 'auth/facebook'
      },
      oAuthWindowType: 'newWindow'
    }),
    AgmCoreModule.forRoot({
      apiKey: environment.googleMapsApiKey
    }),
    HighlightModule.forRoot({
      languages: hljsLanguages
    }),
  ],
  providers: [
    AppState,
    KrameriusApiService,
    BookService,
    Utils,
    SolrService,
    ModsParserService,
    LibrarySearchService,
    DocumentSearchService,
    LocalStorageService,
    SearchService,
    BrowseService,
    ViewerControlsService,
    PeriodicalService,
    CollectionService,
    HistoryService,
    AltoService,
    MusicService,
    AppSettings,
    HttpRequestCache,
    Title,
    AuthService,
    PageTitleService,
    CookieService,
    ShareService,
    AnalyticsService,
    KrameriusInfoService,
    CloudApiService,
    AccountService,
    AngularTokenModule,
    IiifService,
    ZoomifyService,
    LoggerService,
    AdminApiService,
    { provide: HTTP_INTERCEPTORS, useClass: CachingInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


import { AppSettings } from './services/app-settings';
import { PeriodicalFulltextItemComponent } from './periodical/periodical-content/periodical-fulltext-layout/periodical-fulltext-item/periodical-fulltext-item.component';
import { PeriodicalFulltextLayoutComponent } from './periodical/periodical-content/periodical-fulltext-layout/periodical-fulltext-layout.component';
import { MusicService } from './services/music.service';
import { BookSearchComponent } from './book/book-search/book-search.component';
import { AltoService } from './services/alto-service';
import { CollectionService } from './services/collection.service';
import { HistoryService } from './services/history.service';
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
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';


import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ViewerComponent } from './book/viewer/viewer.component';

import { MatomoModule } from 'ngx-matomo';

import { BookComponent } from './book/book.component';
import { HomeComponent } from './home/home.component';
import { BrowseComponent } from './browse/browse.component';
import { NavigationComponent } from './book/navigation/navigation.component';
import { MetadataComponent } from './metadata/metadata.component';
import { FoldersComponent } from './folders/folders.component';
import { FolderComponent } from './folders/folder/folder.component';
import { CuratorListsComponent } from './home/curator-lists/curator-lists.component';

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
import { LazyLoadImageModule, intersectionObserverPreset } from 'ng-lazyload-image';
import { BrowseFiltersComponent } from './browse/browse-filters/browse-filters.component';
import { LogoComponent } from './navbar/logo/logo.component';
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

import { PeriodicalCountComponent } from './periodical/periodical-filters/periodical-count/periodical-count.component';
import { PeriodicalSearchComponent } from './periodical/periodical-filters/periodical-search/periodical-search.component';
import { PeriodicalFiltersComponent } from './periodical/periodical-filters/periodical-filters.component';

import { CollectionsComponent } from './collections/collections.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeLogoComponent } from './home/home-logo/home-logo.component';
import { HttpRequestCache } from './services/http-request-cache.service';
import { HTTP_INTERCEPTORS, HttpClientModule, HttpClient, HttpClientJsonpModule } from '@angular/common/http';
import { CachingInterceptor } from './services/caching-interceptor.service';
import { PageTitleService } from './services/page-title.service';
import { NotFoundComponent } from './not-found/not-found.component';
import { RemovePrefixPipe } from './pipes/remove-prefix.pipe';
import { UpcasePipe } from './pipes/upcase.pipe';

import { CookieService } from 'ngx-cookie-service';
import { ShareService } from './services/share.service';
import { AnalyticsService } from './services/analytics.service';
import { HomeFooterComponent } from './home/home-footer/home-footer.component';
import { KrameriusInfoService } from './services/kramerius-info.service';
import { LoginComponent } from './login/login.component';
import { DocumentSearchService } from './services/document-search.service';

import { HighlightModule } from 'ngx-highlightjs';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import { MapBrowseComponent } from './map/browse/map-browse.component';
import { MapSeriesComponent } from './map/series/map-series.component';
import { CollectionComponent } from './collections/collection/collection.component';
import { IiifService } from './services/iiif.service';
import { ZoomifyService } from './services/zoomify.service';
import { LoggerService } from './services/logger.service';
import { LandingComponent } from './landing/landing.component';
import { StaticPageComponent } from './static-page/static-page.component';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { AdminApiService } from './services/admin-api.service';
import { NavigationSnippetComponent } from './book/navigation/navigation-snippet/navigation-snippet.component';
import { NavigationItemComponent } from './book/navigation/navigation-item/navigation-item.component';
import { SignpostComponent } from './signpost/signpost.component';
import { SignpostLibrariesComponent } from './signpost/libraries/libraries.component';
import { SignpostFooterComponent } from './signpost/footer/footer.component';
import { SignpostHeaderComponent } from './signpost/header/header.component';
import { SignpostHelpComponent } from './signpost/help/help.component';
import { AdminCollectionsComponent } from './dialog/admin-dialog/admin-collections/admin-collections.component';
import { AdminLicencesComponent } from './dialog/admin-dialog/admin-licences/admin-licences.component';
import { AdminAccessibilityComponent } from './dialog/admin-dialog/admin-accessibility/admin-accessibility.component';
import { AdminReindexationComponent } from './dialog/admin-dialog/admin-reindexation/admin-reindexation.component';
import { AdminReprePageComponent } from './dialog/admin-dialog/admin-reprepage/admin-reprepage.component';
import { LicenceService } from './services/licence.service';
import { LicenceMessagesComponent } from './shared/licence-messages/licence-messages.component';
import { PeriodicalUnitLayoutComponent } from './periodical/periodical-content/periodical-unit-layout/periodical-unit-layout.component';
import { PdfViewer2Component } from './book/pdf-viewer2/pdf-viewer2.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PdfService } from './services/pdf.service';
import { AngularEpubViewerModule } from 'angular-epub-viewer';
import { EpubViewerComponent } from './book/epub-viewer/epub-viewer.component';
import { EpubService } from './services/epub.service';
import { CitationService } from './services/citation.service';
import { AuthInterceptor } from './services/auth-interceptor.service';
import { MaterialModule } from './material.module';
import { ShareDialogComponent } from './dialog/share-dialog/share-dialog.component';
import { PdfDialogComponent } from './dialog/pdf-dialog/pdf-dialog.component';
import { BasicDialogComponent } from './dialog/basic-dialog/basic-dialog.component';
import { OcrDialogComponent } from './dialog/ocr-dialog/ocr-dialog.component';
import { AuthorsDialogComponent } from './dialog/authors-dialog/authors-dialog.component';
import { CitationDialogComponent } from './dialog/citation-dialog/citation-dialog.component';
import { MetadataDialogComponent } from './dialog/metadata-dialog/metadata-dialog.component';
import { LicenceDialogComponent } from './dialog/licence-dialog/licence-dialog.component';
import { AdminDialogComponent } from './dialog/admin-dialog/admin-dialog.component';
import { AdminConfirmDialogComponent } from './dialog/admin-dialog/admin-confirm-dialog/admin-confirm-dialog.component';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { PluralPipe } from './pipes/plural.pipe';
import { NgSlimScrollModule } from 'ngx-slimscroll';
import { DatepickerComponent } from './datepicker/datepicker.component';
import { NgxGalleryModule } from '@kolkov/ngx-gallery';
import { GoogleMapsModule } from '@angular/google-maps';
import { CookiebarComponent } from './shared/cookiebar/cookiebar.component';
import { AuthComponent } from './auth/auth.component';
import { AdvancedSearchDialogComponent } from './dialog/advanced-search-dialog/advanced-search-dialog.component';
import { SearchHelpDialogComponent } from './dialog/search-help-dialog/search-help-dialog.component';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MapSeriesService } from './services/mapseries.service';

import { MapViewerComponent } from './book/map-viewer/map-viewer.component';
import { GeoreferenceService } from './services/georeference.service';
import { TtsService } from './services/tts.service';
import { CsvService } from './services/csv.service';
import { FolderService } from './services/folder.service';
import { FolderDialogComponent } from './dialog/folder-dialog/folder-dialog.component';
import { FolderConfirmDialogComponent } from './dialog/folder-confirm-dialog/folder-confirm-dialog.component';
import { FolderShareDialogComponent } from './dialog/folder-share-dialog/folder-share-dialog.component';
import { FolderAdminDialogComponent } from './dialog/folder-admin-dialog/folder-admin-dialog.component';
import { DisplayMetadataDialogComponent} from './dialog/display-metadata-dialog/display-metadata-dialog.component';

import { LicenceWindowComponent } from './shared/licence-window/licence-window.component';
import { NavigationService } from './services/navigation.service';
import { CuttingCardComponent } from './shared/cutting-card/cutting-card.component';
import { AiService } from './services/ai.service';
import { TtsDialogComponent } from './dialog/tts-dialog/tts-dialog.component';
import { LanguageService } from './services/language.service';
import { LLMDialogComponent } from './dialog/llm-dialog/llm-dialog.component';
import { AutocompleterModule } from './common/autocompleter/autocompleter.module';
import { ConfigService } from './services/config.service';
import { SpeechRecognitionService } from './services/speech-recognition.service';
import { UiService } from './services/ui.service';
import { SimilarityDialogComponent } from './dialog/similarity-dialog/similarity-dialog.component';
import { MakariusService } from './services/makarius.service';
import { SheetmusicSimilarityDialogComponent } from './dialog/sheetmusic-similarity-dialog/sheetmusic-similarity-dialog.component';
import { BannerComponent } from './shared/banner/banner.component';

declare var APP_GLOBAL: any;

export function hljsLanguages() {
  return [
    {name: 'json', func: json},
    {name: 'xml', func: xml}
  ];
}

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json?v2.10.8');
}

export function initializeApp(configService: ConfigService) {
  return () => configService.loadConfig().toPromise();
}

export function appInitializerFactory(translate: TranslateService) {
  return () => {
    let lang = '';
    if (!APP_GLOBAL.cookiebar || localStorage.getItem('cpref') == 'all' || localStorage.getItem('cpref') == 'preferential') {
      lang = localStorage.getItem('lang')
    }
    lang = lang || APP_GLOBAL.defaultLanguage || 'cs';
    return translate.use(lang).toPromise();
  };
}

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    ViewerComponent,
    BookComponent,
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
    BrowseFiltersComponent,
    BrowseCountComponent,
    BrowseResultsComponent,
    BrowseToolbarComponent,
    PaginatorComponent,
    AlertComponent,
    BookControlsComponent,
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
    PdfViewer2Component,
    PeriodicalCountComponent,
    PeriodicalSearchComponent,
    PeriodicalFiltersComponent,
    CollectionsComponent,
    CollectionComponent,
    NotFoundComponent,
    RemovePrefixPipe,
    UpcasePipe,
    StaticPageComponent,
    HomeFooterComponent,
    LoginComponent,
    MapBrowseComponent,
    MapSeriesComponent,
    LandingComponent,
    SafeHtmlPipe,
    SignpostComponent,
    SignpostLibrariesComponent,
    SignpostFooterComponent,
    SignpostHeaderComponent,
    SignpostHelpComponent,
    AdminCollectionsComponent,
    AdminLicencesComponent,
    AdminAccessibilityComponent,
    AdminReindexationComponent,
    AdminReprePageComponent,
    LicenceMessagesComponent,
    PeriodicalUnitLayoutComponent,
    EpubViewerComponent,
    ShareDialogComponent,
    PdfDialogComponent,
    BasicDialogComponent,
    OcrDialogComponent,
    LLMDialogComponent,
    AuthorsDialogComponent,
    CitationDialogComponent,
    MetadataDialogComponent,
    LicenceDialogComponent,
    AdminDialogComponent,
    AdminConfirmDialogComponent,
    PluralPipe,
    DatepickerComponent,
    CookiebarComponent,
    AuthComponent,
    AdvancedSearchDialogComponent,
    SearchHelpDialogComponent,
    MapViewerComponent,
    FoldersComponent,
    FolderComponent,
    FolderDialogComponent,
    FolderConfirmDialogComponent,
    FolderShareDialogComponent,
    FolderAdminDialogComponent,
    DisplayMetadataDialogComponent,
    CuratorListsComponent,
    LicenceWindowComponent,
    CuttingCardComponent,
    TtsDialogComponent,
    SimilarityDialogComponent,
    SheetmusicSimilarityDialogComponent,
    BannerComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    FormsModule,
    GoogleMapsModule,
    NgSlimScrollModule,
    NgxGalleryModule,
    Ng2CompleterModule,
    MatomoModule,
    MaterialModule,
    AutocompleterModule,
    MatSlideToggleModule,
    LazyLoadImageModule.forRoot({
      preset: intersectionObserverPreset
    }),
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
    }
    }),
    PdfViewerModule,
    AngularEpubViewerModule,
    ClipboardModule,
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
    PageTitleService,
    CookieService,
    ShareService,
    AnalyticsService,
    KrameriusInfoService,
    CitationService,
    IiifService,
    ZoomifyService,
    LoggerService,
    LicenceService,
    AdminApiService,
    PdfService,
    EpubService,
    MapSeriesService,
    GeoreferenceService,
    MakariusService,
    TtsService,
    AiService,
    CsvService,
    FolderService,
    NavigationService,
    LanguageService,
    SpeechRecognitionService,
    UiService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [ TranslateService ],
      multi: true
    },
    { provide: HTTP_INTERCEPTORS, useClass: CachingInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


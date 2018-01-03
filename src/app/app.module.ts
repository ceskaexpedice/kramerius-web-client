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
import { ViewerControlsService } from './services/viewre-controls.service.';
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
import { Http, HttpModule } from '@angular/http';
import { KrameriusApiService } from './services/kramerius-api.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { TranslatorModule } from 'angular-translator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterializeModule } from 'ng2-materialize';
import { FormsModule } from '@angular/forms';
import { NgDatepickerModule } from './ng-datepicker/ng-datepicker.module';


import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ViewerComponent } from './book/viewer/viewer.component';
import { RouterModule, Routes } from '@angular/router';

import { BookComponent } from './book/book.component';
import { HelpComponent } from './help/help.component';
import { HomeComponent } from './home/home.component';
import { BrowseComponent } from './browse/browse.component';
import { NavigationComponent } from './book/navigation/navigation.component';
import { MetadataComponent } from './metadata/metadata.component';
import { NavigationItemComponent } from './book/navigation/navigation-item/navigation-item.component';

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
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { BrowseFiltersComponent } from './browse/browse-filters/browse-filters.component';
import { DialogOcrComponent } from './dialog/dialog-ocr/dialog-ocr.component';
import { LogoComponent } from './logo/logo.component';
import { PersistentLinkComponent } from './persistent-link/persistent-link.component';
import { PeriodicalService } from './services/periodical.service';


const ROUTES: Routes = [
  { path: '', component: HomeComponent },
  { path: 'browse', component: BrowseComponent },
  { path: 'search', component: SearchComponent },
  { path: 'periodical/:uuid', component: PeriodicalComponent },
  { path: 'uuid/:uuid', component: PersistentLinkComponent },
  // { path: 'help', component: HelpComponent },
  { path: 'view/:uuid', component: BookComponent },
  { path: 'view', component: BookComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    ViewerComponent,
    BookComponent,
    HelpComponent,
    HomeComponent,
    BrowseComponent,
    NavigationComponent,
    MetadataComponent,
    NavigationItemComponent,
    SearchComponent,
    SearchResultsComponent,
    SearchFiltersComponent,
    DocumentCardComponent,
    PeriodicalComponent,
    PeriodicalContentComponent,
    PeriodicalToolbarComponent,
    PeriodicalGridLayoutComponent,
    PeriodicalYearsLayoutComponent,
    PeriodicalCalendarLayoutComponent,
    PeriodicalGridItemComponent,
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
    DialogShareComponent,
    LogoComponent,
    BookSearchComponent,
    PersistentLinkComponent
  ],
  entryComponents: [
    DialogOcrComponent,
    DialogPdfComponent,
    DialogShareComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpModule,
    FormsModule,
    NgDatepickerModule,
    Ng2CompleterModule,
    LazyLoadImageModule,
    MaterializeModule.forRoot(),
    RouterModule.forRoot(ROUTES),
    TranslatorModule.forRoot({
      providedLanguages: ['en', 'cs'],
      defaultLanguage: 'cs'
    })
  ],
  providers: [
    AppState,
    KrameriusApiService,
    BookService,
    Utils,
    SolrService,
    ModsParserService,
    LibrarySearchService,
    LocalStorageService,
    SearchService,
    BrowseService,
    ViewerControlsService,
    PeriodicalService,
    CollectionService,
    HistoryService,
    AltoService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterializeModule } from 'ng2-materialize';


import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ViewerComponent } from './book/viewer/viewer.component';
import { RouterModule } from '@angular/router';

import { BookComponent } from './book/book.component';
import { HelpComponent } from './help/help.component';
import { HomeComponent } from './home/home.component';
import { BrowseComponent } from './browse/browse.component';
import { CollectionsComponent } from './collections/collections.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    ViewerComponent,
    BookComponent,
    HelpComponent,
    HomeComponent,
    BrowseComponent,
    CollectionsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterializeModule.forRoot(),
    RouterModule.forRoot([
      { path: '', component: HomeComponent },
      { path: 'collections', component: CollectionsComponent },
      { path: 'browse', component: BrowseComponent },
      { path: 'help', component: HelpComponent },
      { path: 'documents/:uuid', component: BookComponent }
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { RouterModule } from '@angular/router';
import { TranslatorModule } from 'angular-translator';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSlimScrollModule } from 'ngx-slimscroll';
import { DatepickerComponent } from './datepicker.component';
import { MzTooltipModule } from 'ngx-materialize';
import { AppSettings } from '../services/app-settings';

@NgModule({
  declarations: [DatepickerComponent ],
  imports: [
    CommonModule,
    FormsModule,
    NgSlimScrollModule,
    RouterModule,
    MzTooltipModule,
    TranslatorModule.forRoot({
      providedLanguages: AppSettings.langs,
      defaultLanguage: 'cs'
    })
  ],
  exports: [ DatepickerComponent, CommonModule, FormsModule, NgSlimScrollModule, MzTooltipModule ]
})
export class DatepickerModule {}

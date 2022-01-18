import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSlimScrollModule } from 'ngx-slimscroll';
import { DatepickerComponent } from './datepicker.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [DatepickerComponent ],
  imports: [
    CommonModule,
    FormsModule,
    NgSlimScrollModule,
    RouterModule,
    MatTooltipModule
  ],
  exports: [ DatepickerComponent, CommonModule, FormsModule, NgSlimScrollModule, MatTooltipModule ]
})
export class DatepickerModule {}

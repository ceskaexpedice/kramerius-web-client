import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutocompleterComponent } from './autocompleter.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DropdownDirective } from './dropdown.directive';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
    declarations: [AutocompleterComponent,
        DropdownDirective
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatIconModule
    ],
    exports: [AutocompleterComponent, DropdownDirective],
})
export class AutocompleterModule { }
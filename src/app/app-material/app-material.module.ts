import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule  } from '@angular/material/slide-toggle';
import {MatTabsModule} from '@angular/material/tabs';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatSelectModule} from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import {MatDialogModule} from '@angular/material/dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete'; // Added
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MAT_DATE_FORMATS, NativeDateAdapter, DateAdapter } from '@angular/material/core'; // Import MAT_DATE_FORMATS, NativeDateAdapter, DateAdapter

export const MY_DATE_FORMATS = {
    parse: {
        dateInput: 'DD/MM/YYYY',
    },
    display: {
        dateInput: 'DD/MM/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatSlideToggleModule ,
    MatTabsModule,   
    MatChipsModule,
    MatIconModule,MatFormFieldModule,MatButtonModule,MatInputModule,MatListModule,
    MatGridListModule,MatSelectModule,MatTableModule, MatPaginatorModule,MatSortModule,
    MatDialogModule,MatDatepickerModule,MatNativeDateModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule, // Added
    MatSnackBarModule,
    MatMenuModule,
    MatCheckboxModule,
    MatExpansionModule
  ],
  exports: [
    MatSlideToggleModule,
    MatTabsModule,MatFormFieldModule,    
    MatChipsModule,
    MatIconModule,MatButtonModule,MatInputModule,MatListModule,
    MatGridListModule,MatSelectModule,MatTableModule, MatPaginatorModule,MatSortModule,
    MatDialogModule,MatDatepickerModule,MatNativeDateModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule, // Added
    MatSnackBarModule,
    MatMenuModule,
    MatCheckboxModule,
    MatExpansionModule
  ],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
    { provide: DateAdapter, useClass: NativeDateAdapter }, // Explicitly provide NativeDateAdapter
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS } // Provide the custom date formats
  ]
})
export class AppMaterialModule { }

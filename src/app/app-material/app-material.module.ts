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
    MatSnackBarModule
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
    MatSnackBarModule
  ],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} }
  ]
})
export class AppMaterialModule { }

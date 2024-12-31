import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule  } from '@angular/material/slide-toggle';
import {MatTabsModule} from '@angular/material/tabs';
import {MatChipsModule} from '@angular/material/chips';
import {CdkDragDrop, moveItemInArray, CdkDrag, CdkDropList} from '@angular/cdk/drag-drop';
import {NgFor} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatSelectModule} from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import {MatDialogModule} from '@angular/material/dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatSlideToggleModule ,
    MatTabsModule,   
    MatChipsModule, CdkDropList, NgFor, CdkDrag,
    MatIconModule,MatFormFieldModule,MatButtonModule,MatInputModule,MatListModule,
    MatGridListModule,MatSelectModule,MatTableModule, MatPaginatorModule,MatSortModule,
    MatDialogModule,MatDatepickerModule,MatNativeDateModule
  ],
  exports: [
    MatSlideToggleModule,
    MatTabsModule,MatFormFieldModule,    
    MatChipsModule, CdkDropList, NgFor, CdkDrag,
    MatIconModule,MatButtonModule,MatInputModule,MatListModule,
    MatGridListModule,MatSelectModule,MatTableModule, MatPaginatorModule,MatSortModule,
    MatDialogModule,MatDatepickerModule,MatNativeDateModule
  ],
  providers: [
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} }
  ]
})
export class AppMaterialModule { }

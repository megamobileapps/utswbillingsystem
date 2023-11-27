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

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatSlideToggleModule ,
    MatTabsModule,   
    MatChipsModule, CdkDropList, NgFor, CdkDrag,
    MatIconModule,MatFormFieldModule,MatButtonModule,MatInputModule,MatListModule,
    MatGridListModule,
    
  ],
  exports: [
    MatSlideToggleModule,
    MatTabsModule,MatFormFieldModule,    
    MatChipsModule, CdkDropList, NgFor, CdkDrag,
    MatIconModule,MatButtonModule,MatInputModule,MatListModule,
    MatGridListModule,
  ]
})
export class AppMaterialModule { }

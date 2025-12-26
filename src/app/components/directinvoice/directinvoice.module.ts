import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DirectinvoiceComponent } from './directinvoice.component';

const routes: Routes = [
  {
    path: '',
    component: DirectinvoiceComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DirectinvoiceComponent // It's standalone, so import it here
  ]
})
export class DirectinvoicePageModule { }

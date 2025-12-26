import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillComponent } from './bill.component';
import { BillDetailsComponent } from '../bill-details/bill-details.component';

const routes: Routes = [
  { path: '', component: BillComponent },
  { path: 'details/:id', component: BillDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillsRoutingModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BillsRoutingModule } from './bills-routing.module';
import { BillComponent } from './bill.component';
import { BillDetailsComponent } from '../bill-details/bill-details.component';
import { AppMaterialModule } from 'src/app/app-material/app-material.module';
import { SoldItemsSummaryComponent } from '../sold-items-summary/sold-items-summary.component';


@NgModule({
  declarations: [
    BillComponent,
    SoldItemsSummaryComponent
  ],
  imports: [
    CommonModule,
    BillsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    BillDetailsComponent
  ]
})
export class BillsModule { }

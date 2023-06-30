import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CatalogueComponent } from './components/catalogue/catalogue.component';
import { ReceiptDetailsComponent } from './components/receipt.details/receipt.details.component';
import { CheckoutComponent } from './components/checkout/checkout.component';


const routes : Routes = [
  {path:'catalogue', component:CatalogueComponent},
  {path:'receipt', component:ReceiptDetailsComponent},
  {path:'checkout', component:CheckoutComponent},
   
  { 
    path: '',
    component:CatalogueComponent     
},
]

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports:[RouterModule]
})
export class AppRoutingModule { }

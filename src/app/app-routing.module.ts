import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CatalogueComponent } from './components/catalogue/catalogue.component';
import { ReceiptDetailsComponent } from './components/receipt.details/receipt.details.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { InventoryComponent } from './components/inventory/inventory.component';


const routes : Routes = [
  {path:'catalogue', component:CatalogueComponent},
  {path:'receipt', component:ReceiptDetailsComponent},
  {path:'checkout', component:CheckoutComponent},
  {path:'addinventory', component:InventoryComponent},
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

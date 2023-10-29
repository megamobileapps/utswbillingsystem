import { NgModule } from '@angular/core';
// import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CatalogueComponent } from './components/catalogue/catalogue.component';
import { ReceiptDetailsComponent } from './components/receipt.details/receipt.details.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { CartComponent } from './components/cart/cart.component';
import { LoginComponent } from './components/auth/login/login.component';
import { LogoutComponent } from './components/auth/login/logout.component';
import { AuthGuard } from './components/auth/auth.guard';
import { GenerateBarcodeComponent } from './components/generate-barcode/generate-barcode.component';


const routes : Routes = [
  {path:'catalogue', component:CatalogueComponent,canActivate: [AuthGuard]},
  {path:'receipt', component:ReceiptDetailsComponent,canActivate: [AuthGuard]},
  {path:'checkout', component:CheckoutComponent,canActivate: [AuthGuard]},
  {path:'addinventory', component:InventoryComponent,canActivate: [AuthGuard]},
  {path:'cart', component:CartComponent,canActivate: [AuthGuard]},
  {path:'newcode',component:GenerateBarcodeComponent,canActivate:[AuthGuard]},
  {path:'login', component:LoginComponent},
  {path:'logout', component:LogoutComponent},
  { 
    path: '',
    component:CatalogueComponent,canActivate: [AuthGuard]     
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

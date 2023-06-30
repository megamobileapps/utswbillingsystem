import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BillComponent } from './components/bill/bill.component';
import { CatalogueComponent } from './components/catalogue/catalogue.component';
import { AppRoutingModule } from './app-routing.module';
import {APP_BASE_HREF, DatePipe, CommonModule} from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BasicAuthInterceptor } from './interceptors/basic-auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { CategoryfilterPipe } from './pipes/utswtopicfilter';
import { SearchStrfilterPipe } from './pipes/utswsearchfilter';
import { ReceiptDetailsComponent } from './components/receipt.details/receipt.details.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { InventoryComponent } from './components/inventory/inventory.component';
@NgModule({
  declarations: [
    AppComponent,
    BillComponent,
    CatalogueComponent,
    CategoryfilterPipe,
    SearchStrfilterPipe,
    ReceiptDetailsComponent,
    CheckoutComponent,
    InventoryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {provide: APP_BASE_HREF, useValue: '/in/billing/'} ,
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

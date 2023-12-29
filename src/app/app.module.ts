import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import {AppMaterialModule } from './app-material/app-material.module'
import { AppComponent } from './app.component';
import { BillComponent } from './components/bill/bill.component';
import { CatalogueComponent } from './components/catalogue/catalogue.component';
import { AppRoutingModule } from './app-routing.module';
import {APP_BASE_HREF, DatePipe, CommonModule} from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BasicAuthInterceptor } from './interceptors/basic-auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { CategoryfilterPipe } from './pipes/utswtopicfilter';
import { SearchStrfilterPipe } from './pipes/utswsearchfilter';
import { ReceiptDetailsComponent } from './components/receipt.details/receipt.details.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { InventoryComponent } from './components/inventory/inventory.component';
import { DisplayitemComponent } from './components/displayitem/displayitem.component';
import { DisplaycartitemComponent } from './components/displaycartitem/displaycartitem.component';
import { DisplaycartComponent } from './components/displaycart/displaycart.component';
import { TopheaderComponent } from './components/topheader/topheader.component';
import { CartComponent } from './components/cart/cart.component';
import { LoginComponent } from './components/auth/login/login.component';
import { LogoutComponent } from './components/auth/login/logout.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { GenerateBarcodeComponent } from './components/generate-barcode/generate-barcode.component';
import { UtswGenericfilterPipe } from './pipes/utswgenericfilter';
import { NgxBarcode6Module } from 'ngx-barcode6';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from '@angular/fire/compat';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { environment } from '../environments/environment';
import { CommonService } from './services/common.service';
import { BarcodeService } from './services/barcode.service';
import { InventoryService } from './services/inventory.service';
import { ListInventoryComponent } from './components/inventory/list-inventory/list-inventory.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';


@NgModule({
  declarations: [
    AppComponent,
    BillComponent,
    CatalogueComponent,
    CategoryfilterPipe,
    SearchStrfilterPipe,
    UtswGenericfilterPipe,
    ReceiptDetailsComponent,
    CheckoutComponent,
    InventoryComponent,
    DisplayitemComponent,
    DisplaycartitemComponent,
    DisplaycartComponent,
    TopheaderComponent,
    CartComponent,
    LoginComponent,
    LogoutComponent,
    GenerateBarcodeComponent,
    ListInventoryComponent,
    ConfirmationDialogComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgSelectModule,
    NgxBarcode6Module,
    BrowserAnimationsModule,
    AppMaterialModule,
    AngularFireModule.initializeApp(environment.firebase),
    provideFirebaseApp(() => initializeApp({"projectId":"bookstore-c1f49","appId":"1:342884727291:web:2530396bfdccb07f","databaseURL":"https://bookstore-c1f49.firebaseio.com","storageBucket":"bookstore-c1f49.appspot.com","apiKey":"AIzaSyAPInkWwSrhwOE4SMapLb7S5t50Ge_vi7M","authDomain":"bookstore-c1f49.firebaseapp.com","messagingSenderId":"342884727291","measurementId":"G-RX2PQEWHQN"})),
    provideDatabase(() => getDatabase()),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {provide: APP_BASE_HREF, useValue: '/in/billing/'} ,
    DatePipe,
    SearchStrfilterPipe,
    UtswGenericfilterPipe,
    CommonService,
    BarcodeService,
    InventoryService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

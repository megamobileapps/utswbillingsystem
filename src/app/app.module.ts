import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common'; // For structural directives, pipes etc.
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; // For HTTP calls
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // For forms

// Custom App Modules and Standalone Components
import { AppRoutingModule } from './app-routing.module';
import { AppMaterialModule } from './app-material/app-material.module';
import { AppComponent } from './app.component';
import { TopheaderComponent } from './components/topheader/topheader.component'; // Non-standalone, declared
import { InventoryComponent } from './components/inventory/inventory.component'; // Standalone, imported
import { DirectinvoiceFormComponent } from './components/directinvoice/directinvoice-form.component'; // Standalone, imported

// Interceptors
import { BasicAuthInterceptor } from './interceptors/basic-auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

// Pipes
import { CategoryfilterPipe } from './pipes/utswtopicfilter';
import { SearchStrfilterPipe } from './pipes/utswsearchfilter';
import { UtswGenericfilterPipe } from './pipes/utswgenericfilter';

// Services
import { CommonService } from './services/common.service';
import { BarcodeService } from './services/barcode.service';
import { InventoryService } from './services/inventory.service';

// Angular CDK and other third-party modules
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxBarcode6Module } from 'ngx-barcode6';
import { QRCodeModule } from 'angularx-qrcode';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { DragDropModule } from '@angular/cdk/drag-drop';

// NgRx related imports
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { inventoryReducer } from './store/inventory/inventory.reducer';
import { InventoryEffects } from './store/inventory/inventory.effects';
import { barcodeReducer } from './store/barcode/barcode.reducer';
import { BarcodeEffects } from './store/barcode/barcode.effects';
import { barcodeComponentReducer } from './store/barcode-component/barcode-component.reducer';
import { BarcodeComponentEffects } from './store/barcode-component/barcode-component.effects';
import { billReducer } from './store/bill/bill.reducer';
import { BillEffects } from './store/bill/bill.effects';
import { invoiceSoldItemsReducer } from './store/invoice-sold-items/invoice-sold-items.reducer';
import { InvoiceSoldItemsEffects } from './store/invoice-sold-items/invoice-sold-items.effects';

// Environment for StoreDevtools
import { environment } from '../environments/environment';

// Other Angular core providers
import { APP_BASE_HREF, DatePipe } from '@angular/common';

// Application Components (non-standalone, declared here)
import { CatalogueComponent } from './components/catalogue/catalogue.component';
import { ReceiptDetailsComponent } from './components/receipt.details/receipt.details.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { DisplayitemComponent } from './components/displayitem/displayitem.component';
import { DisplaycartitemComponent } from './components/displaycartitem/displaycartitem.component';
import { DisplaycartComponent } from './components/displaycart/displaycart.component';
import { CartComponent } from './components/cart/cart.component';
import { LoginComponent } from './components/auth/login/login.component';
import { LogoutComponent } from './components/auth/login/logout.component';
import { GenerateBarcodeComponent } from './components/generate-barcode/generate-barcode.component';
import { ListInventoryComponent } from './components/inventory/list-inventory/list-inventory.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { NotificationComponent } from './components/notification/notification.component';



@NgModule({
  declarations: [
    AppComponent,
    CatalogueComponent,
    CategoryfilterPipe,
    SearchStrfilterPipe,
    UtswGenericfilterPipe,
    ReceiptDetailsComponent,
    CheckoutComponent,
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
    NotificationComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule, // Needed for router-outlet
    BrowserAnimationsModule,
    CommonModule, // Needed for NgIf, NgFor, pipes etc.
    AppMaterialModule, // Exports most material modules
    HttpClientModule,
    FormsModule, // For ngModel
    ReactiveFormsModule, // For formGroup
    NgSelectModule,
    NgxBarcode6Module,
    QRCodeModule,
    ZXingScannerModule,
    DragDropModule, // For cdkDropList, cdkDrag in GenerateBarcodeComponent
    InventoryComponent, // Standalone component
    DirectinvoiceFormComponent, // Standalone component

    // NgRx Store configuration
    StoreModule.forRoot({
      inventory: inventoryReducer,
      barcodes: barcodeReducer,
      barcodeComponents: barcodeComponentReducer,
      bills: billReducer,
      invoiceSoldItems: invoiceSoldItemsReducer,
    }),
    EffectsModule.forRoot([InventoryEffects, BarcodeEffects, BarcodeComponentEffects, BillEffects, InvoiceSoldItemsEffects]),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
    }),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: APP_BASE_HREF, useValue: '/in/new-billing/' },
    DatePipe,
    // Provide pipes if they are not standalone and used in templates not declared in this module directly
    SearchStrfilterPipe,
    UtswGenericfilterPipe,
    // Provide services
    CommonService,
    BarcodeService,
    InventoryService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
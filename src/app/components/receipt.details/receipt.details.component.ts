import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { InvoiceDataItem } from 'src/app/models/invoice-data-item';
import { UTSWCartItem } from 'src/app/models/cart-item';
import { CartDetails } from 'src/app/providers/cart.details';
import { CartService } from 'src/app/providers/cart.provider';
import { DataService } from 'src/app/services/data.service'; // Re-added
import { Store } from '@ngrx/store';
import * as BillActions from 'src/app/store/bill/bill.actions';

@Component({
  selector: 'app-receipt.details',
  templateUrl: './receipt.details.component.html',
  styleUrls: ['./receipt.details.component.css']
})
export class ReceiptDetailsComponent implements OnInit {

  printOnNormalPrinter:boolean=false;
  error:String='';
  isPrintingExistingBill = false;
  printableBill: InvoiceDataItem | undefined;
  printableBillItems: UTSWCartItem[] = [];
  printableTotalAmount = 0;
  printableTotalQuantity = 0;
  printableGrossAmount = 0;

  static   CONST_POSUSERID = "9999";
  static   CONST_POSUSERPSWD = "8888";
  constructor(
    private _cartService:CartService, 
    private _dataService:DataService, // Re-added
    private datePipe:DatePipe,
    private route: ActivatedRoute,
    private store: Store
    ) { }

  soldItemForBackend():String{
 
    var subQuantity:String = "";
    this.currentCart!.invoicedatalist.forEach((billItem) =>{
      if (subQuantity !="") {
        subQuantity += "##";
      }
      subQuantity +=
          billItem.productId! + "::" + billItem.quantity.toString()+"::"+billItem.labeldate.toString()+"::"+billItem.productCategory.toString();
    });
    return subQuantity;
  }

  ngOnInit(): void {
    const invoiceId = this.route.snapshot.queryParamMap.get('invoiceid');
    if (invoiceId) {
      this.isPrintingExistingBill = true;
      this.printOnNormalPrinter = false; // As requested, for thermal printer layout
      this._dataService.getInvoiceDataFromServer_with_invoiceid(invoiceId).subscribe((invoices: InvoiceDataItem[]) => { // Explicitly type invoices
        if (invoices && invoices.length > 0) {
          this.printableBill = invoices[0];
          try {
            if (this.printableBill && this.printableBill.invoicedata) { // Null check
              let items: UTSWCartItem[] = JSON.parse(this.printableBill.invoicedata);
              if (typeof items === 'string') {
                items = JSON.parse(items);
              }
              this.printableBillItems = items;
              this.printableBillItems.forEach(item => {
                this.printableTotalQuantity += item.quantity;
                this.printableTotalAmount += item.quantity * item.productPrice;
                this.printableGrossAmount += item.quantity * item.initialPrice;
              });
            }
          } catch (error) {
            console.error('Error parsing invoicedata for printing:', error);
          }
        }
      });
    } else {
      // Original logic for saving a new bill
      const currentCart = this.currentCart!;
      let invoiceToSave: InvoiceDataItem = {
        invoicenumber: currentCart.invoicenumber.toString(),
        invoicedate: this.datePipe.transform(currentCart.invoicedateNum,'yyyy-MM-dd') || '',
        username: currentCart.username.toString(),
        phonenumber: currentCart.phonenumber.toString(),
        emailid: currentCart.emailid.toString(),
        amount: (this._cartService.totalAmount - this.customerDiscount).toFixed(2), // Convert to string
        discount: Number(this.customerDiscount).toFixed(2), // Convert to string
        payment_method: currentCart.payment_method.toString(),
        invoicedata: JSON.stringify(JSON.stringify(currentCart.invoicedatalist)), // Correctly stringify the list
        salepoint: 'office',
        soldsubjects: this.soldItemForBackend().toString(),
        posoperation: this.isCartEditOperation == false ? "addinvoice" : "editinvoice",
        id: currentCart.invoicenumber.toString(), // Assuming ID is same as invoicenumber
      };

      // Dispatch the action to create the bill
      console.log('Dispatching BillActions.createBill with bill:', invoiceToSave); // Added console log
      this.store.dispatch(BillActions.createBill({ bill: invoiceToSave }));
      this._cartService.isEditing = false; // Moved from success callback, assuming immediate effect
    }
  }

  print(): void {
    window.print();
  }

  get currentCart():CartDetails|undefined|null{
    return this._cartService.currentCart;
  }
  get txId():number|null|undefined{
    return this._cartService.currentCart?.invoicenumber;
  }

  get isCartEditOperation():boolean{
    return this._cartService.currentCart?.isEditing!;
  }
  get txDate():number|null|undefined{
    return this._cartService.currentCart?.invoicedateNum;
  }

  get totalAmount():number{
    return this._cartService.totalAmount;
  }

  get totalQuantity():number{
    return this._cartService.totalQuantity;
  }

  get grossAmount():number{
    return this._cartService.grossAmount;
  }

  get customerDiscount():number{
    console.log('customerDiscount '+this._cartService.discount);
    return this._cartService.discount??0;
  }
}

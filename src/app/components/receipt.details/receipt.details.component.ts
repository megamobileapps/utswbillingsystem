import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { InvoiceDataItem } from 'src/app/models/invoice-data-item';
import { UTSWCartItem } from 'src/app/models/cart-item';
import { CartDetails } from 'src/app/providers/cart.details';
import { CartService } from 'src/app/providers/cart.provider';
import { DataService } from 'src/app/services/data.service';

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
    private _dataService:DataService,
    private datePipe:DatePipe,
    private route: ActivatedRoute
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
      this._dataService.getInvoiceDataFromServer_with_invoiceid(invoiceId).subscribe(invoices => {
        if (invoices && invoices.length > 0) {
          this.printableBill = invoices[0];
          try {
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
          } catch (error) {
            console.error('Error parsing invoicedata for printing:', error);
          }
        }
      });
    } else {
      // Original logic for saving a new bill
      var data ={...this.currentCart};
      var pos_operation = this.isCartEditOperation==false?"addinvoice":"editinvoice";
      data = {...data, ...{
                      "amount":(this._cartService.totalAmount - this.customerDiscount),
                      "invoicedate":this.datePipe.transform(this.currentCart?.invoicedateNum,'yyyy-MM-dd'),
                      "salepoint":"office",
                      "soldsubjects":this.soldItemForBackend(),
                      "posoperation":pos_operation, "invoicedata":JSON.stringify(JSON.stringify(data.invoicedatalist))}};

      this._dataService.saveInvoiceDataOnServer(data).pipe(first())
      .subscribe(
          data => {
            alert('bill is sent to the Center');
            this._cartService.isEditing = false;
          },
          error => {
              this.error = error;
              console.log("receipt component: Error in submitting to service ", error);
              alert('Server encountered problem while bill submission '+error)
          });
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

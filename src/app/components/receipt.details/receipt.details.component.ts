import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
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
  static   CONST_POSUSERID = "9999";
  static   CONST_POSUSERPSWD = "8888";
  constructor(private _cartService:CartService, private _dataService:DataService,
    private datePipe:DatePipe) { }

  soldItemForBackend():String{
 
    var subQuantity:String = "";
    this.currentCart!.invoicedatalist.forEach((billItem) =>{
      if (subQuantity !="") {
        subQuantity += "##";
      }
      subQuantity +=
          billItem.productId! + "::" + billItem.quantity.toString();
    });
    return subQuantity;
  }

  ngOnInit(): void {
    var data ={...this.currentCart};//TODO fill this data
    var pos_operation = this.isCartEditOperation==false?"addinvoice":"editinvoice";
    // Add additional parameters
    //
    var extraData = {};
    //nameValuePairs["soldsubjects"] = _getSoldSubQuanity(cart.cart);
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
          this._cartService.isEditing = false; //reset editing field to false
        },
        error => {
            this.error = error;
            console.log("receipt component: Error in submitting to service ", error);
            alert('Server encountered problem while bill submission '+error)
            
        });
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

import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UTSWCartItem } from 'src/app/models/cart-item';
import { InOfficePrice } from 'src/app/models/inoffice';
import { CartDetails } from 'src/app/providers/cart.details';
import { CartService } from 'src/app/providers/cart.provider';
import { ScreenSizeService } from 'src/app/services/screen-size.service';

@Component({
  selector: 'app-displayitem',
  templateUrl: './displayitem.component.html',
  styleUrls: ['./displayitem.component.css']
})
export class DisplayitemComponent implements OnInit {

  @Input() ofItem:InOfficePrice|null=null
  @Input() enableBuy:boolean=true

  isMobileScreen:boolean = false;

  constructor(private _cartService:CartService, private screenSizeService:ScreenSizeService) { 
    this.isMobileScreen = this.screenSizeService.getIsMobileResolution;
  }

  get cart():CartDetails|null|undefined{
    return this._cartService.currentCart;
  }

  ngOnInit(): void {
  }
  
  checkIfCartItemExistInCart(ofItem:UTSWCartItem|null):Array<UTSWCartItem>|undefined{
    if(null == ofItem) return [];
    return this.cart?.invoicedatalist.filter((value, index)=> 
    value.productCategory == ofItem.productCategory &&
    value.productId == ofItem.productId &&
    value.id == ofItem.id &&
    value.productName == ofItem.productName
    );
    
  }
  
  // return -1 if it does not exist
  checkIfExistInCart(ofItem:InOfficePrice|null):Array<UTSWCartItem>|undefined{
    if(null == ofItem) return [];
    return this.cart?.invoicedatalist.filter((value, index)=> 
    value.productCategory == ofItem.grade &&
    value.productId == ofItem.subId &&
    value.id == ofItem.id &&
    value.productName == ofItem.subject
    );
    
  }

  prepareCartItem(txId:number, ofItem:InOfficePrice):UTSWCartItem{
    var retVal:UTSWCartItem  = {
      txId:txId,
      id:ofItem.id,    
      quantityProvider:new BehaviorSubject<number>(1),
      quantity:1,
      productCategory:ofItem.grade,    
      productId:ofItem.subId,
      productName:ofItem.subject,
      initialPrice:ofItem.pcost,
      productPrice:ofItem.netvalue, // initialprice - discount
      discount:ofItem.discount,        
      gst:ofItem.gst,      
      hsn:ofItem.hsn,
      unitTag:'Nos',
      image:''

    };
    return retVal;
  }
  addToCart(ofItem:InOfficePrice|null){
    var existingItem = this.checkIfExistInCart(ofItem!);
    var txId = this.cart!.invoicedatalist.length == 0?
              Math.floor(Math.random() * 1000000)
              :this.cart!.invoicedatalist[0].txId;
    this._cartService.currentCart!.invoicenumber = txId;
    if(existingItem!.length == 0) {
      // txId = Math.floor(Math.random() * 1000000);
      this.cart!.invoicedatalist.push(this.prepareCartItem(txId, ofItem!))
    }else{
      //item.quantity.next(item.quantity.getValue()+1);
      existingItem![0].quantityProvider .next(existingItem![0].quantityProvider.getValue()+1);
      existingItem![0].quantity +=1;
    }

    // this.cart.push(ofItem!);
  }


}

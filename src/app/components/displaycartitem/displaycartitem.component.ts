import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UTSWCartItem } from 'src/app/models/cart-item';
import { InOfficePrice, InventoryItem } from 'src/app/models/inoffice';
import { CartDetails } from 'src/app/providers/cart.details';
import { CartService } from 'src/app/providers/cart.provider';

@Component({
  selector: 'app-displaycartitem',
  templateUrl: './displaycartitem.component.html',
  styleUrls: ['./displaycartitem.component.css']
})
export class DisplaycartitemComponent implements OnInit {

  @Input() item:UTSWCartItem|null=null
  @Input() indexI:number=0

  constructor(private _cartService:CartService) { 

  }

  get cart():CartDetails|null|undefined{
    return this._cartService.currentCart;
  }

  ngOnInit(): void {
  }

  addQuantity(ofItem:UTSWCartItem|null){
    var existingItem = this.checkIfCartItemExistInCart(ofItem!);
    var txId = this.cart!.invoicedatalist.length == 0?
              Math.floor(Math.random() * 1000000)
              :this.cart!.invoicedatalist[0].txId;
    this._cartService.currentCart!.invoicenumber = txId;
    if(existingItem.length == 0) {
      // txId = Math.floor(Math.random() * 1000000);
      this.cart!.invoicedatalist.push(ofItem!);
    }else{
      //item.quantity.next(item.quantity.getValue()+1);
      existingItem[0].quantityProvider .next(existingItem[0].quantityProvider.getValue()+1);
      existingItem[0].quantity +=1;
    }
    // this.cart.push(ofItem!);
  }

  reduceQuantity(ofItem:UTSWCartItem|null){
    var existingItem = this.checkIfCartItemExistInCart(ofItem!);
   
    if(existingItem.length == 0) {
     
    }else{
      //item.quantity.next(item.quantity.getValue()+1);
      if(existingItem[0].quantityProvider.value >0){
        existingItem[0].quantityProvider .next(existingItem[0].quantityProvider.getValue()-1);
        existingItem[0].quantity -=1;
      }
    }
    // this.cart.push(ofItem!);
  }

  removeFromCart(ofItem:InventoryItem|null){
    var existingItem = this.checkIfExistInCart(ofItem!);    
    if(existingItem.length == 0) {
      // txId = Math.floor(Math.random() * 1000000);
      
    }else{
      //item.quantity.next(item.quantity.getValue()+1);
      if(existingItem[0].quantityProvider.getValue() <=0 ) {

      }else{
        existingItem[0].quantityProvider .next(existingItem[0].quantityProvider.getValue()-1);
        existingItem[0].quantity -=1;
      }
    }
  }

  

  prepareCartItem(txId:number, ofItem:InventoryItem):UTSWCartItem{
    var retVal:UTSWCartItem  = {
      txId:txId,
      id:ofItem.barcode.toString(),    
      quantityProvider:new BehaviorSubject<number>(1),
      quantity:1,
      productCategory:ofItem.brand,    
      productId:ofItem.barcode,
      productName:ofItem.productname,
      initialPrice:ofItem.mrp,
      productPrice:ofItem.netvalue, // initialprice - discount
      discount:ofItem.discount,        
      gst:ofItem.percentgst,      
      hsn:ofItem.hsn,
      unitTag:'Nos',
      image:'',
      labeldate:ofItem.labeleddate

    };
    return retVal;
  }

  // return -1 if it does not exist
  checkIfExistInCart(ofItem:InventoryItem|null):Array<UTSWCartItem>{
    if(null == ofItem) return [];
    return this.cart!.invoicedatalist.filter((value, index)=> 
    value.productCategory == ofItem.brand &&
    value.productId == ofItem.barcode &&
    value.id == ofItem.barcode.toString() &&
    value.productName == ofItem.productname
    );
    
  }

  checkIfCartItemExistInCart(ofItem:UTSWCartItem|null):Array<UTSWCartItem>{
    if(null == ofItem) return [];
    return this.cart!.invoicedatalist.filter((value, index)=> 
    value.productCategory == ofItem.productCategory &&
    value.productId == ofItem.productId &&
    value.id == ofItem.id &&
    value.productName == ofItem.productName
    );
    
  }

  addToCart(ofItem:InventoryItem|null){
    var existingItem = this.checkIfExistInCart(ofItem!);
    var txId = this.cart!.invoicedatalist.length == 0?
              Math.floor(Math.random() * 1000000)
              :this.cart!.invoicedatalist[0].txId;
    this._cartService.currentCart!.invoicenumber = txId;
    if(existingItem.length == 0) {
      // txId = Math.floor(Math.random() * 1000000);
      this.cart!.invoicedatalist.push(this.prepareCartItem(txId, ofItem!))
    }else{
      //item.quantity.next(item.quantity.getValue()+1);
      existingItem[0].quantityProvider .next(existingItem[0].quantityProvider.getValue()+1);
      existingItem[0].quantity +=1;
    }

    // this.cart.push(ofItem!);
  }

}

import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { UTSWCartItem } from "../models/cart-item";
import { CartDetails } from "./cart.details";
import { InventoryItem } from "../models/inoffice";

@Injectable({ providedIn: 'root' })
export class CartService{
    
    _cartDetails:CartDetails|null = new CartDetails();
    private cartClearedSource = new Subject<void>();
    cartCleared$ = this.cartClearedSource.asObservable();
    private cartUpdatedSource = new Subject<void>();
    cartUpdated$ = this.cartUpdatedSource.asObservable();
    private cartRestoredSource = new Subject<void>();
    cartRestored$ = this.cartRestoredSource.asObservable();
    
    _oldCartDetails:Array<CartDetails>=[];

    constructor() {
    }

    get currentCart():CartDetails|null|undefined{
        return this._cartDetails;
    }

    get oldTxList():Array<CartDetails>{
        return this._oldCartDetails;
    }
    createNewCart():void{
        this._cartDetails = new CartDetails();
        this.cartClearedSource.next();
      }

      clearCart():void{
        if (this._cartDetails) {
          this._cartDetails.invoicedatalist = [];
        }
        this.cartClearedSource.next();
      }
      populateCartFrom(cartDtls:CartDetails):void{
        this._cartDetails = cartDtls;
        this.cartUpdatedSource.next();
        this.cartRestoredSource.next();
      }

      checkIfExistInCart(ofItem:InventoryItem|null):Array<UTSWCartItem>|undefined{
        if(null == ofItem) 
          return [];
                   
          return this.currentCart?.invoicedatalist.filter((value, index)=> 
            value.productCategory == ofItem.brand &&
            value.productId == ofItem.barcode &&
            value.id == ofItem.barcode.toString() &&
            value.productName == ofItem.productname
          );
      }
    
      prepareCartItem(txId:number, ofItem:InventoryItem):UTSWCartItem{
        var retVal:UTSWCartItem  = {
          txId:txId,
          id:ofItem.barcode.toString(),    
          quantityProvider:new BehaviorSubject<number>(ofItem.quantity),
          quantity:ofItem.quantity,
          productCategory:ofItem.brand,    
          productId:ofItem.barcode,
          productName:ofItem.productname,
          initialPrice:ofItem.mrp,
          productPrice:(ofItem.mrp)*((100-ofItem.discount)/100), // initialprice - discount
          discount:ofItem.discount,        
          gst:ofItem.percentgst,      
          hsn:ofItem.hsn,
          unitTag:'Nos',
          image:'',
          labeldate:ofItem.labeleddate
        };
        return retVal;
      }

      addToCart(ofItem:InventoryItem|null){
        var existingItem = this.checkIfExistInCart(ofItem!);
        var txId = this.currentCart!.invoicedatalist.length == 0?
                  Math.floor(Math.random() * 1000000)
                  :this.currentCart!.invoicedatalist[0].txId;
        this.currentCart!.invoicenumber = txId;
        this.currentCart!.invoicedate = Date.now().toString();
        if(existingItem!.length == 0) {
          this.currentCart!.invoicedatalist.push(this.prepareCartItem(txId, ofItem!))
        }else{
          existingItem![0].quantityProvider .next(existingItem![0].quantityProvider.getValue()+1);
          existingItem![0].quantity +=1;
        }
        this.cartUpdatedSource.next();
      }

      removeFromCart(ofItem:InventoryItem|null){
        var existingItem = this.checkIfExistInCart(ofItem!);
        var txId = this.currentCart!.invoicedatalist.length == 0?
                  Math.floor(Math.random() * 1000000)
                  :this.currentCart!.invoicedatalist[0].txId;
        this.currentCart!.invoicenumber = txId;
        if(existingItem!.length == 0) {
        }else{
          existingItem![0].quantityProvider .next(0);
          existingItem![0].quantity =0;
        }
        this.cartUpdatedSource.next();
      }

      get totalAmount ():number {
        let totalAmount = 0;
        
        this._cartDetails?.invoicedatalist.forEach(element => {      
          totalAmount += (element.productPrice * element.quantityProvider.getValue());
        });
        return totalAmount;
      }
    
    get totalQuantity ():number {
        let totalQty = 0;
        
        this._cartDetails?.invoicedatalist.forEach(element => {      
            totalQty += ( element.quantityProvider.getValue());
        });
        return totalQty;
    }

    get grossAmount ():number {
        let grossAmnt = 0;
        
        this._cartDetails?.invoicedatalist.forEach(element => {      
            grossAmnt += ( element.initialPrice * element.quantityProvider.getValue());
        });
        return grossAmnt;
    }

            get discount ():number|undefined {

              return this._cartDetails?.discount

            }    initialize_from_existing_cartdata(json_data:any){
      this._cartDetails?.initialize_meta_data(json_data)
    }

    get isEditing():boolean|undefined{
      return this._cartDetails?.isEditing;
    }
    set isEditing(val:boolean){
      if(this._cartDetails != null)
        this._cartDetails.isEditing = val;
    }
  };

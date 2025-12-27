import { Injectable } from "@angular/core";
import { UTSWCartItem } from "../models/cart-item";
import { CartDetails } from "./cart.details";
@Injectable({ providedIn: 'root' })
export class CartService{
    
    _cartDetails:CartDetails|null = new CartDetails();
    
    _oldCartDetails:Array<CartDetails>=[];

    get currentCart():CartDetails|null|undefined{
        return this._cartDetails;
    }

    get oldTxList():Array<CartDetails>{
        return this._oldCartDetails;
    }
    createNewCart():void{
        this._cartDetails = new CartDetails();
      }
      populateCartFrom(cartDtls:CartDetails):void{
        this._cartDetails = cartDtls;
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
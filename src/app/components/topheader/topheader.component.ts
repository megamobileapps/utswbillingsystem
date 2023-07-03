import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { UTSWCartItem } from 'src/app/models/cart-item';
import { CartDetails } from 'src/app/providers/cart.details';
import { CartService } from 'src/app/providers/cart.provider';
import { DataService } from 'src/app/services/data.service';
import { ScreenSizeService } from 'src/app/services/screen-size.service';

@Component({
  selector: 'app-topheader',
  templateUrl: './topheader.component.html',
  styleUrls: ['./topheader.component.css']
})
export class TopheaderComponent implements OnInit {
  isMobileScreen: boolean=false;

  get oldTxList():Array<CartDetails>{
    return this._cartService.oldTxList
  }

  
  constructor(private _dataService:DataService,
    private route: ActivatedRoute,
    private router:Router,
    private _sanitizer: DomSanitizer,
    private _cartService:CartService, private screenSizeService:ScreenSizeService) { 

      this.isMobileScreen = this.screenSizeService.getIsMobileResolution;
    }

    get cart():Array<UTSWCartItem>{
      return this._cartService.currentCart!.invoicedatalist;
    }
  ngOnInit(): void {
  }

  createNewCart():void{
    this._cartService.createNewCart();
    this.router.navigate(['/catalogue']);

    // this.cartstore = new CartDetails();
  }

  clearCart():void{
    this._cartService.currentCart!.invoicedatalist=[];
  }

  holdCart():void{
    if(this.totalQuantity > 0) {

      if(!this.cartAlreadyInOldlist(this._cartService.currentCart!)){
        this.oldTxList.push(this._cartService.currentCart!);
      }
  
    }   
    this.createNewCart();
  }

  cartAlreadyInOldlist(cart:CartDetails):boolean{
    var retVal:boolean = false;

    this.oldTxList.forEach((element)=>{
      if (element.invoicenumber == cart.invoicenumber){
        retVal = true;
      
      }
    });
    return retVal;
  }
  populateCartFrom(cart:CartDetails):void{
    // push current cart to back 
    // if current cart has some items then push to old stack
    if(this.totalQuantity > 0 
      && !this.cartAlreadyInOldlist(cart)
      && this._cartService.currentCart?.invoicenumber != cart.invoicenumber){
      this.oldTxList.push(this._cartService.currentCart!);
    }
    
    // load from old cart
    this._cartService.populateCartFrom(cart);
  }

  get txId():number{
    return this._cartService.currentCart!.invoicenumber ;
  }
  get totalAmount ():number {
    return this._cartService.totalAmount;
  }

  get totalQuantity ():number {
    
    return this._cartService.totalQuantity;
  }

  get customerName():String|null|undefined{
    return this._cartService.currentCart?.username;
  }

  get customerPh():String|null|undefined{
    return this._cartService.currentCart?.phonenumber;
  }
}

import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { UTSWCartItem } from 'src/app/models/cart-item';
import { CartDetails } from 'src/app/providers/cart.details';
import { CartService } from 'src/app/providers/cart.provider';
import { DataService } from 'src/app/services/data.service';
import { ScreenSizeService } from 'src/app/services/screen-size.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  isMobileScreen: boolean=false;
  today: number = Date.now();

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
  get txId():number{
    return this._cartService.currentCart!.invoicenumber ;
  }
  get totalAmount ():number {
    return this._cartService.totalAmount;
  }

  get totalQuantity ():number {
    
    return this._cartService.totalQuantity;
  }

  get customerDiscount ():number {
    return this._cartService.discount??0
  }
}

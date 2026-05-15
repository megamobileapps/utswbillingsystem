import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { UTSWCartItem } from 'src/app/models/cart-item';
import { CartDetails } from 'src/app/providers/cart.details';
import { CartService } from 'src/app/providers/cart.provider';
import { CommonService } from 'src/app/services/common.service';
import { DataService } from 'src/app/services/data.service';
import { ScreenSizeService } from 'src/app/services/screen-size.service';
import { Store } from 'src/app/models/store';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-topheader',
  templateUrl: './topheader.component.html',
  styleUrls: ['./topheader.component.css']
})
export class TopheaderComponent implements OnInit {
  isMobileScreen: boolean=false;
  currentStore: Store | null = null;
  allStores: Store[] = [];
  isSuperUser: boolean = false;

  get oldTxList():Array<CartDetails>{
    return this._cartService.oldTxList
  }

  
  constructor(private _dataService:DataService,
    private route: ActivatedRoute,
    private router:Router,
    private _sanitizer: DomSanitizer,
    private _cartService:CartService, 
    private screenSizeService:ScreenSizeService,
    private authService: AuthService) { 

      this.isMobileScreen = this.screenSizeService.getIsMobileResolution;
    }


    get cart():Array<UTSWCartItem>{
      return this._cartService.currentCart!.invoicedatalist;
    }
  ngOnInit(): void {
    // Listen for user changes to update superuser status and store info
    this.authService.user?.subscribe(user => {
      console.log("TopheaderComponent: Received user update:", user);
      if (user && user.id !== -1) {
        this.isSuperUser = user.is_superuser ?? false;
        console.log("TopheaderComponent: Updated isSuperUser:", this.isSuperUser);
        this.loadStoreInfo();
      } else {
        this.isSuperUser = false;
        this.allStores = [];
        this.currentStore = null;
      }
    });
    
    // Listen for store context changes
    this.authService.selectedStoreId$.subscribe(storeId => {
      if (storeId && this.allStores.length > 0) {
        this.currentStore = this.allStores.find(s => s.id === storeId) || null;
      }
    });
  }

  loadStoreInfo() {
    const user = this.authService.userValue;
    if (user) {
      this._dataService.getStores().subscribe(stores => {
        this.allStores = stores;
        const selectedId = this.authService.selectedStoreId || user.store_id;
        this.currentStore = stores.find(s => s.id === selectedId) || { id: selectedId!, name: `Store ${selectedId}` };
      });
    }
  }

  onStoreChange(storeId: number) {
    console.log("Switching to store:", storeId);
    this.authService.setStoreContext(storeId);
    // Optionally reload current route or show notification
    window.location.reload(); // Quickest way to ensure all services refresh data
  }

  createNewCart():void{
    this._cartService.createNewCart();
    this.router.navigate(['/catalogue']);

    // this.cartstore = new CartDetails();
  }

  clearCart():void{
    this._cartService.clearCart();
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

import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UTSWCartItem } from 'src/app/models/cart-item';
import { InOfficeCat, InOfficePrice } from 'src/app/models/inoffice';
import { CartDetails } from 'src/app/providers/cart.details';
import { CartService } from 'src/app/providers/cart.provider';
import { DataService } from 'src/app/services/data.service';
import { ScreenSizeService } from 'src/app/services/screen-size.service';

@Component({
  selector: 'app-catalogue',
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.css']
})

export class CatalogueComponent implements OnInit {
  catalogueItems:Array<InOfficePrice>=[];
  categories:Array<InOfficeCat>=[];
  selectedCat:String='';
  searchStr:String='g1';
  isMobileScreen:boolean=false;
 
  today: number = Date.now();
  
  // cartstore:CartDetails|null|undefined=this._cartService.currentCart;

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
    this._dataService.getOfficeRates().subscribe((d) => { 
      this.catalogueItems = d; 
      console.log(d);
      this.getCategories();       
    });
  }

  getCategories():void{
    this._dataService.getInofficeCategories().subscribe((d) => { 
      this.categories = d; 
      console.log(d);       
    });
  }
  setCatSelection(cat:String){
    this.selectedCat = cat;
  }

  filterResults(flt:String){
    this.searchStr = flt;
    return false;
  }

  
  

  get totalAmount ():number {
    return this._cartService.totalAmount;
  }

  get totalQuantity ():number {
    
    return this._cartService.totalQuantity;
  }

  // createNewCart():void{
  //   this._cartService.createNewCart();
  //   // this.cartstore = new CartDetails();
  // }

  // clearCart():void{
  //   this._cartService.currentCart!.invoicedatalist=[];
  // }

  // holdCart():void{
  //   this.oldTxList.push(this._cartService.currentCart!);
  //   this.createNewCart();
  // }

  // populateCartFrom(cart:CartDetails):void{
  //   this._cartService.populateCartFrom(cart);
  // }

  get txId():number{
    return this._cartService.currentCart!.invoicenumber ;
  }
}

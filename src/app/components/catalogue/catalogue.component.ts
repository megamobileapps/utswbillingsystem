import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UTSWCartItem } from 'src/app/models/cart-item';
import { InOfficeCat, InOfficePrice } from 'src/app/models/inoffice';
import { CartDetails } from 'src/app/providers/cart.details';
import { CartService } from 'src/app/providers/cart.provider';
import { DataService } from 'src/app/services/data.service';

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
 
  today: number = Date.now();
  
  // cartstore:CartDetails|null|undefined=this._cartService.currentCart;

  get oldTxList():Array<CartDetails>{
    return this._cartService.oldTxList
  }

  
  constructor(private _dataService:DataService,
    private route: ActivatedRoute,
    private router:Router,
    private _sanitizer: DomSanitizer,
    private _cartService:CartService) { }

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
  // return -1 if it does not exist
  checkIfExistInCart(ofItem:InOfficePrice|null):Array<UTSWCartItem>{
    if(null == ofItem) return [];
    return this.cart.filter((value, index)=> 
    value.productCategory == ofItem.grade &&
    value.productId == ofItem.subId &&
    value.id == ofItem.id &&
    value.productName == ofItem.subject
    );
    
  }

  checkIfCartItemExistInCart(ofItem:UTSWCartItem|null):Array<UTSWCartItem>{
    if(null == ofItem) return [];
    return this.cart.filter((value, index)=> 
    value.productCategory == ofItem.productCategory &&
    value.productId == ofItem.productId &&
    value.id == ofItem.id &&
    value.productName == ofItem.productName
    );
    
  }

  addToCart(ofItem:InOfficePrice|null){
    var existingItem = this.checkIfExistInCart(ofItem!);
    var txId = this.cart.length == 0?
              Math.floor(Math.random() * 1000000)
              :this.cart[0].txId;
    this._cartService.currentCart!.invoicenumber = txId;
    if(existingItem.length == 0) {
      // txId = Math.floor(Math.random() * 1000000);
      this.cart.push(this.prepareCartItem(txId, ofItem!))
    }else{
      //item.quantity.next(item.quantity.getValue()+1);
      existingItem[0].quantityProvider .next(existingItem[0].quantityProvider.getValue()+1);
      existingItem[0].quantity +=1;
    }

    // this.cart.push(ofItem!);
  }

  addQuantity(ofItem:UTSWCartItem|null){
    var existingItem = this.checkIfCartItemExistInCart(ofItem!);
    var txId = this.cart.length == 0?
              Math.floor(Math.random() * 1000000)
              :this.cart[0].txId;
    this._cartService.currentCart!.invoicenumber = txId;
    if(existingItem.length == 0) {
      // txId = Math.floor(Math.random() * 1000000);
      this.cart.push(ofItem!);
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

  removeFromCart(ofItem:InOfficePrice|null){
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

  get totalAmount ():number {
    return this._cartService.totalAmount;
  }

  get totalQuantity ():number {
    
    return this._cartService.totalQuantity;
  }

  createNewCart():void{
    this._cartService.createNewCart();
    // this.cartstore = new CartDetails();
  }

  clearCart():void{
    this._cartService.currentCart!.invoicedatalist=[];
  }

  holdCart():void{
    this.oldTxList.push(this._cartService.currentCart!);
    this.createNewCart();
  }

  populateCartFrom(cart:CartDetails):void{
    this._cartService.populateCartFrom(cart);
  }

  get txId():number{
    return this._cartService.currentCart!.invoicenumber ;
  }
}

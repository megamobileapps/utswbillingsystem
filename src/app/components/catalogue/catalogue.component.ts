import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';
import { UTSWCartItem } from 'src/app/models/cart-item';
import { InOfficeCat, InOfficePrice, InventoryItem } from 'src/app/models/inoffice';
import { CartDetails } from 'src/app/providers/cart.details';
import { CartService } from 'src/app/providers/cart.provider';
import { DataService } from 'src/app/services/data.service';
import { InventoryService } from 'src/app/services/inventory.service';
import { ScreenSizeService } from 'src/app/services/screen-size.service';
import Quagga from 'quagga';
import { BarcodeFormat } from '@zxing/library';
@Component({
  selector: 'app-catalogue',
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.css']
})

export class CatalogueComponent implements OnInit {
  // catalogueItems:Array<InOfficePrice>=[];
  @ViewChild('videoElement') videoElement: ElementRef;
  catalogueItems:Array<InventoryItem>=[];
  categories:Array<InOfficeCat>=[];
  selectedCat:String='';
  searchStr:String='g1';
  isMobileScreen:boolean=false;
  oldinvoiceid:string="-1"
 
  today: number = Date.now();
  filterwithbarcode:string|null=null;
  
  // cartstore:CartDetails|null|undefined=this._cartService.currentCart;

  get oldTxList():Array<CartDetails>{
    return this._cartService.oldTxList
  }

  scannedResult: string = '';
  allowedFormats = [BarcodeFormat.CODE_128, BarcodeFormat.QR_CODE]; // Add formats as needed

  onCodeResult(result: string): void {
    console.log('Scanned code:', result);
    this.scannedResult = result;
  }
  onError(error: any): void {
    console.error('Scanning error:', error);
  }
  
  constructor(private _dataService:DataService,
    private route: ActivatedRoute,
    private router:Router,
    private _sanitizer: DomSanitizer,
    private _inventoryService:InventoryService,
    private _cartService:CartService, private screenSizeService:ScreenSizeService) { 
      this._cartService.isEditing = false;
      this.isMobileScreen = this.screenSizeService.getIsMobileResolution;
      this.route.queryParams.subscribe(params => {
        console.log('Query Params:', params);
        if (typeof params['oldinvoiceid'] !== 'undefined' ){
          this.oldinvoiceid = params['oldinvoiceid']; // Assign the query parameter value
          this._cartService.isEditing = true; //set editing field so that edit invoice operation can be performed
        }
        console.log(`isEditing Cart = ${this._cartService.isEditing}`)
      });
    }

    get cart():Array<UTSWCartItem>{
      return this._cartService.currentCart!.invoicedatalist;
    }
  ngOnInit(): void {
    
    this.getAllInventory();
  }

  quagga_init() {
    Quagga.init({
      inputStream: {
        type: 'LiveStream',
        constraints: {
          width: { min: 640 }, // Set higher resolution for better focus
          height: { min: 480 },
          facingMode: 'environment', // Use the back camera on mobile devices
          focusMode: 'continuous', // Continuous autofocus
        },
        // target: this.videoElement.nativeElement,
        target: document.querySelector('#scanner'),
      },
      decoder: {
        readers: ['code_128_reader']
      }
    }, (error:any) => {
      if (error) {
        console.error(error);
        return;
      }
      Quagga.start();
    });
    Quagga.onDetected((data: any) => {
      console.log('Barcode detected and processed:', data.codeResult.code);
    });
  }

  getAllInventory(filterwith=''){
    let self = this;
     this._inventoryService.getAllInventory().subscribe(data => { 
       console.log('getAllInventory(): step 1', JSON.stringify(data));
      //  self.inventoryList=[];
      var rcvddata=[];
       for(let i=0;i<data.length;i++){
         console.log('getAllInventory(): step 2', JSON.stringify(data[i]));
         let datekeys = Object.keys(data[i])
         console.log('getAllInventory(): filter value is '+this.filterwithbarcode);
         if (this.filterwithbarcode != null || filterwith != ''){
          if (typeof data[i][datekeys[0]].itemdetails != 'undefined')
            if(data[i][datekeys[0]].itemdetails['barcode'] == this.filterwithbarcode??filterwith)
              for (let datekeyindex=0;datekeyindex<datekeys.length; datekeyindex++)
                rcvddata.push( data[i][datekeys[datekeyindex]].itemdetails ); 
         }else{
          for (let datekeyindex=0;datekeyindex<datekeys.length; datekeyindex++){
              if (typeof data[i][datekeys[datekeyindex]].itemdetails != 'undefined'){
                if (typeof data[i][datekeys[datekeyindex]].itemdetails["discount"] == 'undefined') {
                  data[i][datekeys[datekeyindex]].itemdetails["discount"] = 0;
                }
                if (typeof data[i][datekeys[datekeyindex]].itemdetails["netvalue"] == 'undefined') {
                  data[i][datekeys[datekeyindex]].itemdetails["netvalue"] = data[i][datekeys[datekeyindex]].itemdetails["mrp"]*(100-data[i][datekeys[datekeyindex]].itemdetails["discount"])/100;
                }
                rcvddata.push( data[i][datekeys[datekeyindex]].itemdetails ); 
              }
          }
              // rcvddata.push( data[i][datekeys[0]].itemdetails );        
         }
         }
         this.catalogueItems = rcvddata;
         console.log('getAllInventory(): Data after filling ', JSON.stringify(rcvddata));
       
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

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, filter, map as rxjsMap } from 'rxjs';
import { UTSWCartItem } from 'src/app/models/cart-item';
import { InOfficeCat, InventoryItem } from 'src/app/models/inoffice'; // Removed InOfficePrice from here, not used
import { CartDetails } from 'src/app/providers/cart.details';
import { CartService } from 'src/app/providers/cart.provider';
import { DataService } from 'src/app/services/data.service';
import { ScreenSizeService } from 'src/app/services/screen-size.service';
import Quagga from 'quagga';
import { BarcodeFormat } from '@zxing/library';
import { DatePipe } from '@angular/common';
import { DirectinvoiceFormComponent } from '../directinvoice/directinvoice-form.component'; // Keep consistent if used
import { Store } from '@ngrx/store';
import { selectAllInventory, selectInventoryStatus } from 'src/app/store/inventory/inventory.selectors';
import * as InventoryActions from 'src/app/store/inventory/inventory.actions';
import * as InvoiceSoldItemsActions from 'src/app/store/invoice-sold-items/invoice-sold-items.actions';
import { selectAllInvoiceSoldItems } from 'src/app/store/invoice-sold-items/invoice-sold-items.selectors';

@Component({
  selector: 'app-catalogue',
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.css']
})

export class CatalogueComponent implements OnInit {
  @ViewChild('videoElement') videoElement: ElementRef;
  catalogueItems:Array<InventoryItem>=[];
  categories:Array<InOfficeCat>=[];
  selectedCat:string='';
  searchStr:string=''; // Corrected initialization
  isMobileScreen:boolean=false;
  oldinvoiceid:string="-1"
  allsoldItems:Record<string, number> = {}
 
  today: number = Date.now();
  filterwithbarcode:string|null=null;
  private filterBarcodeSubject = new BehaviorSubject<string | null>(null);

  constructor(private _dataService:DataService,
    private route: ActivatedRoute,
    private router:Router,
    private _sanitizer: DomSanitizer,
    private datePipe:DatePipe,
    private _cartService:CartService, private screenSizeService:ScreenSizeService,
    private store: Store
    ) { 
      this._cartService.isEditing = false;
      this.isMobileScreen = this.screenSizeService.getIsMobileResolution;
      this.route.queryParams.subscribe(params => {
        console.log('Query Params:', params);
        if (typeof params['oldinvoiceid'] !== 'undefined' ){
          this.oldinvoiceid = params['oldinvoiceid'];
          this._cartService.isEditing = true;
        }
        console.log(`isEditing Cart = ${this._cartService.isEditing}`)
      });
    }

    get cart():Array<UTSWCartItem>{
      return this._cartService.currentCart!.invoicedatalist;
    }
  ngOnInit(): void {
    this.store.dispatch(InventoryActions.loadInventory());
    this.subscribeToInventoryStore();
    this.subscribeToInvoiceSoldItemsStore();
    this.getInvoiceSoldItemsFromServer();
    this.getCategories();
  }

  subscribeToInventoryStore(): void {
    combineLatest([
      this.store.select(selectAllInventory),
      this.filterBarcodeSubject.asObservable()
    ]).pipe(
      rxjsMap(([inventory, filterBarcode]) => {
        return inventory.map(itemdetails => {
          let sold_key = `${itemdetails.barcode}` 
                        + (typeof itemdetails.labeleddate != 'undefined' ? `::${itemdetails.labeleddate}` : '')
                        + (typeof itemdetails.brand != 'undefined' ? `::${itemdetails.brand}` : '');
          let sold_items = this.allsoldItems[sold_key]??0
          let present_available_items = itemdetails.quantity - sold_items
          return { ...itemdetails, sold:sold_items, qtyavailable: present_available_items };
        }).filter(item => {
          if (filterBarcode != null && item.barcode.toLowerCase() == filterBarcode.toLowerCase()) {
            return true;
          } else if (filterBarcode == null || filterBarcode === '') {
            if (this.searchStr && item.productname.toLowerCase().includes(this.searchStr.toLowerCase())) {
              return true;
            }
            return true;
          }
          return false;
        }).filter(item => {
            if(filterBarcode == null || filterBarcode === ''){
              return item.productname.toLowerCase().includes(this.searchStr.toLowerCase());
            }
            return true;
        });
      })
    ).subscribe(filteredAndProcessedInventory => {
      this.catalogueItems = filteredAndProcessedInventory;
    });
  }

  subscribeToInvoiceSoldItemsStore(): void {
    this.store.select(selectAllInvoiceSoldItems).subscribe(soldItems => {
      this.allsoldItems = {};
      soldItems.forEach(val => {
        let sold_key = `${val.barcode}` 
                        + (typeof val.labeldate != 'undefined' ? `::${val.labeldate}` : '')
                        + (typeof val.brand != 'undefined' ? `::${val.brand}` : '');
        this.allsoldItems[sold_key] = (this.allsoldItems[sold_key]??0) + val.quantity;
      });
      this.filterBarcodeSubject.next(this.filterwithbarcode);
    });
  }

  quagga_init() {
    // Check if Quagga is defined before using it
    if (typeof Quagga !== 'undefined') {
      Quagga.init({
        inputStream: {
          type: 'LiveStream',
          constraints: {
            width: { min: 640 },
            height: { min: 480 },
            facingMode: 'environment',
            focusMode: 'continuous',
          },
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
    } else {
      console.warn('Quagga is not loaded. Barcode scanning functionality will be limited.');
    }
  }

   getInvoiceSoldItemsFromServer(startDate:Date|null=new Date(), endDate:Date|null=new Date()){
    let tr_start_date:string = this.datePipe.transform(startDate,'yyyy-MM-dd')??'2024-01-13';
    let tr_end_date:string = this.datePipe.transform(endDate,'yyyy-MM-dd')??'2099-01-13';
    
    this.store.dispatch(InvoiceSoldItemsActions.loadInvoiceSoldItems({ startDate: tr_start_date, endDate: tr_end_date }));
   }

  getCategories():void{
    this._dataService.getInofficeCategories().subscribe((d) => { 
      this.categories = d; 
      console.log(d);       
    });
  }
  setCatSelection(cat:string){
    this.selectedCat = cat;
  }

  filterResults(flt:string){
    this.searchStr = flt;
    this.filterBarcodeSubject.next(null);
    return false;
  }

  get totalAmount ():number {
    return this._cartService.totalAmount;
  }

  get totalQuantity ():number {
    return this._cartService.totalQuantity;
  }

  get txId():number{
    return this._cartService.currentCart!.invoicenumber ;
  }
}

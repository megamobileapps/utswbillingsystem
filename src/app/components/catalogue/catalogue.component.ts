import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, Renderer2, OnDestroy } from '@angular/core';
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
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-catalogue',
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.css', './catalogue.component.mobile.css']
})

export class CatalogueComponent implements OnInit, AfterViewInit, OnDestroy {
  selectedTab: string = 'manual';
  @ViewChild('videoElement') videoElement: ElementRef;
  @ViewChild('virtualScrollViewport') virtualScrollViewport: ElementRef;
  catalogueItems:Array<InventoryItem>=[];
  categories:Array<InOfficeCat>=[];
  selectedCat:string='';
  isMobileScreen:boolean=false;
  oldinvoiceid:string="-1"
  allsoldItems:Record<string, number> = {}
 
  today: number = Date.now();
  filterwithbarcode:string|null=null;
  private filterBarcodeSubject = new BehaviorSubject<string | null>(null);

  dataSource = new MatTableDataSource<InventoryItem>([]);
  displayedColumns: string[] = ['productname', 'mrp', 'qtyavailable', 'actions'];
  @ViewChild(MatSort) sort: MatSort;
  private resizeObserver: ResizeObserver;

  constructor(private _dataService:DataService,
    private route: ActivatedRoute,
    private router:Router,
    private _sanitizer: DomSanitizer,
    private datePipe:DatePipe,
    private _cartService:CartService, private screenSizeService:ScreenSizeService,
    private store: Store,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private elementRef: ElementRef,
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
    this.dataSource.filter = JSON.stringify({search: '', category: ''});
    this.dataSource.filterPredicate = (data: InventoryItem, filter: string) => {
      if (!filter) {
        return true;
      }
      try {
        const filterObject = JSON.parse(filter);
        const dataStr = data.productname.toLowerCase() + data.barcode.toLowerCase() + (data.brand ? data.brand.toLowerCase() : '');
        const categoryMatch = filterObject.category ? data.brand.toLowerCase().includes(filterObject.category.toLowerCase()) : true;
        const searchMatch = filterObject.search ? dataStr.includes(filterObject.search) : true;
        return categoryMatch && searchMatch;
      } catch (e) {
        return true;
      }
    };
    // this.getCategories();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.calculateTableHeight();
    this.setupResizeObserver();
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(entries => {
      this.calculateTableHeight();
    });
    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  calculateTableHeight(): void {
    if (!this.virtualScrollViewport) {
      return;
    }

    const hostElement = this.elementRef.nativeElement;
    const filterControlsContainer = hostElement.querySelector('.card-header');

    let elementsAboveTableHeight = 0;
    if (filterControlsContainer) {
      elementsAboveTableHeight += filterControlsContainer.offsetHeight;
    }

    const availableHeightOfHost = hostElement.offsetHeight;
    const finalHeight = availableHeightOfHost - elementsAboveTableHeight;
    const minAllowedHeight = 300; 
    
    this.renderer.setStyle(this.virtualScrollViewport.nativeElement, 'height', `${Math.max(finalHeight, minAllowedHeight)}px`);
  }

  applyFilter(event: any) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = JSON.stringify({search: filterValue.trim().toLowerCase(), category: this.selectedCat});
  }

  subscribeToInventoryStore(): void {
    this.store.select(selectAllInventory).subscribe(inventory => {
      this.dataSource.data = inventory.map(itemdetails => {
        let sold_key = `${itemdetails.barcode}` 
                      + (typeof itemdetails.labeleddate != 'undefined' ? `::${itemdetails.labeleddate}` : '')
                      + (typeof itemdetails.brand != 'undefined' ? `::${itemdetails.brand}` : '');
        let sold_items = this.allsoldItems[sold_key]??0
        let present_available_items = itemdetails.quantity - sold_items
        return { ...itemdetails, sold:sold_items, qtyavailable: present_available_items };
      });
      console.log('dataSource.data', this.dataSource.data);
    });
  }

  setCatSelection(cat:string){
    this.selectedCat = cat;
    const filterValue = (document.querySelector('#filter') as HTMLInputElement).value;
    this.dataSource.filter = JSON.stringify({search: filterValue.trim().toLowerCase(), category: this.selectedCat});
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

  get totalAmount ():number {
    return this._cartService.totalAmount;
  }

  get totalQuantity ():number {
    return this._cartService.totalQuantity;
  }

  get txId():number{
    return this._cartService.currentCart!.invoicenumber ;
  }

  selectTab(tabName: string) {
    this.selectedTab = tabName;
  }
}

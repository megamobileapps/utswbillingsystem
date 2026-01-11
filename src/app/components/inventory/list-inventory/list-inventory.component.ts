import { Component, Input, OnInit, AfterViewInit, ViewChild, OnChanges, SimpleChanges, ElementRef, Renderer2, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';

import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, shareReplay, first } from 'rxjs/operators';

import { DataService } from 'src/app/services/data.service';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { InventoryItem } from 'src/app/models/inoffice';
import * as InventoryActions from 'src/app/store/inventory/inventory.actions';
import { selectAllInventory, selectInventoryStatus } from 'src/app/store/inventory/inventory.selectors';

// For mobile responsive design
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-list-inventory',
  templateUrl: './list-inventory.component.html',
  styleUrls: ['./list-inventory.component.css'],
})
export class ListInventoryComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() barcode: string | null = null;
  @Input() filterwithbarcode: string | null = null;
  @Input() isEmbeddedInFilteredContext: boolean = false; // New input for conditional filtering
  @Input() customHeightClass: string | null = null; // New input for custom height class

  
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger; 
  @ViewChild('virtualScrollViewport') virtualScrollViewport!: ElementRef; // Reference to the cdk-virtual-scroll-viewport

  isHandset$: Observable<boolean>; // Made public for use in template via async pipe

  // Table data
  inventoryList: InventoryItem[] = [];
  dataSource = new MatTableDataSource<InventoryItem>([]);
  
  allColumns: string[] = ['productname', 'labeleddate', 'qtyavailable', 'cp', 'vendor', 'barcode', 'hsn', 'quantity', 'sold', 'unit', 'shippingcost', 'percentgst', 'netcp', 'calculatedmrp', 'mrp', 'fixedprofit', 'percentprofit', 'brand'];
  optionalColumns: string[] = ['barcode', 'vendor','labeleddate','hsn', 'quantity', 'sold', 'unit', 'shippingcost', 'percentgst', 'netcp', 'calculatedmrp', 'mrp', 'fixedprofit', 'percentprofit', 'brand'];

  // This will hold the columns selected by the user (for desktop view initially)
  _displayedColumns: string[] = ['productname', 'cp', 'qtyavailable',   'actions'];

  // This will hold the columns specific to mobile view (a subset)
  _mobileDisplayedColumns: string[] = ['productname', 'cp', 'qtyavailable',   'actions'];

  // This is the array that the mat-table will actually bind to
  currentDisplayedColumns: string[] = []; 

  allsoldItems: Record<string, number> = {};
  isLoading = true;
  private filterBarcodeSubject = new BehaviorSubject<string | null>(null);
  
  // Date range form
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  private resizeObserver: ResizeObserver;


  constructor(
    private formBuilder: FormBuilder,
    private _dataService: DataService,
    private datePipe: DatePipe,
    private breakpointObserver: BreakpointObserver,
    private _liveAnnouncer: LiveAnnouncer, private dialog: MatDialog,
    private router: Router, // Inject Router
    private store: Store,
    private elementRef: ElementRef, // Inject ElementRef
    private renderer: Renderer2 // Inject Renderer2
  ){
    this.dataSource.filterPredicate = (data: InventoryItem, filter: string) => {
      const dataStr = data.productname.toLowerCase() + data.barcode.toLowerCase() + (data.brand ? data.brand.toLowerCase() : '');
      return dataStr.includes(filter);
    };

    // Initialize isHandset$
    this.isHandset$ = this.breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.TabletPortrait,
      Breakpoints.Small
    ]).pipe(
      map(result => result.matches),
      shareReplay()
    );
  }

  ngOnInit(): void {
    this.subscribeToInventoryStore();
    this.getInvoiceSoldItemsFromServer();

    // Subscribe to handset changes to update displayed columns
    this.isHandset$.subscribe((isHandset: boolean) => {
      this.updateCurrentDisplayedColumns(isHandset);
    });
  }

  

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['barcode'] && changes['barcode'].currentValue) {
      this.filterBarcodeSubject.next(changes['barcode'].currentValue);
    }
  }

  updateCurrentDisplayedColumns(isHandset: boolean): void {
    // Always use the user's selected columns for currentDisplayedColumns.
    // The responsive CSS and horizontal scrolling will handle the layout on mobile.
    const userColumns = this._displayedColumns.filter(col => col !== 'actions'); // Ensure 'actions' is not duplicated
    this.currentDisplayedColumns = [...userColumns, 'actions'];
  }

  toggleColumn(column: string) {
    const index = this._displayedColumns.indexOf(column);
    if (index > -1) {
      this._displayedColumns.splice(index, 1);
    } else {
      this._displayedColumns.push(column);
    }
    // Re-evaluate currentDisplayedColumns after user selection
    this.isHandset$.pipe(first()).subscribe((isHandset: boolean) => {
      this.updateCurrentDisplayedColumns(isHandset);
    });
  }

  toggleAllColumns() {
    if (this.areAllColumnsSelected()) {
      this._displayedColumns = ['productname', 'labeleddate', 'qtyavailable', 'cp', 'vendor', 'actions'];
    } else {
      this._displayedColumns = [...this.allColumns, 'actions'];
    }
    // Re-evaluate currentDisplayedColumns after user selection
    this.isHandset$.pipe(first()).subscribe((isHandset: boolean) => {
      this.updateCurrentDisplayedColumns(isHandset);
    });
  }

  areAllColumnsSelected() {
    // This should check against _displayedColumns
    return this.optionalColumns.every(column => this._displayedColumns.includes(column));
  }

  subscribeToInventoryStore(): void {
    this.store.select(selectInventoryStatus).subscribe(status => {
      this.isLoading = status === 'loading';
    });

    combineLatest([
      this.store.select(selectAllInventory),
      this.filterBarcodeSubject.asObservable()
    ]).pipe(
      map(([inventory, filterBarcode]) => {
        return inventory.map(itemdetails => {
          let sold_key = `${itemdetails.barcode}` 
                        + (typeof itemdetails.labeleddate != 'undefined' ? `::${itemdetails.labeleddate}` : '')
                        + (typeof itemdetails.brand != 'undefined' ? `::${itemdetails.brand}` : '');
          let sold_items = this.allsoldItems[sold_key] ?? 0;
          let present_available_items = itemdetails.quantity - sold_items;
          return { ...itemdetails, sold:sold_items, qtyavailable: present_available_items };
        }).filter(item => {
          if (this.isEmbeddedInFilteredContext) {
            // If embedded in a filtered context, filter by barcode.
            // If filterBarcode is null, no items should be displayed.
            return filterBarcode !== null && item.barcode === filterBarcode;
          } else {
            // For standalone page, display all items by default.
            return true;
          }
        });
      })
    ).subscribe(filteredAndProcessedInventory => {
      this.dataSource.data = filteredAndProcessedInventory;
      this.dataSource.sort = this.sort;
      // Recalculate height after data loads, might change scrollbars
      this.calculateTableHeight();
    });
  }
  
  onEditInventory(item: any) {
    this.router.navigate(['/addinventory'], { queryParams: { data: JSON.stringify(item) } });
  }

  openDialogForDeleteConfirmation(event:any, item:InventoryItem) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent,{
      data:{
        message: 'Are you sure want to delete this Inventory Data?',
        buttonText: {
          ok: 'Delete',
          cancel: 'Cancel'
        }
      }
    });
    
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {  
        this.store.dispatch(InventoryActions.deleteInventory({ barcode: item.barcode, labeldate: item.labeleddate }));
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.calculateTableHeight(); // Recalculate height after filter applies
  }

  filter_clicked() {
    this.getInvoiceSoldItemsFromServer(this.range.controls['start'].value, this.range.controls['end'].value)
  }

  getInvoiceSoldItemsFromServer(startDate:Date|null=new Date(), endDate:Date|null=new Date()){
    let tr_start_date:string = this.datePipe.transform(startDate,'yyyy-MM-dd')??'2024-01-13';
    let tr_end_date:string = this.datePipe.transform(endDate,'yyyy-MM-dd')??'2099-01-13';
    
    this._dataService.getInvoiceSoldItemsFromServer(tr_start_date, tr_end_date).subscribe((d:any) => {       
      d.forEach((val:any)=>{
        let sold_key = `${val["barcode"]}` 
                        + (typeof val["labeldate"] != 'undefined' ? `::${val["labeldate"]}` : '')
                        + (typeof val["brand"] != 'undefined' ? `::${val["brand"]}` : '');
        this.allsoldItems[ sold_key ]= (this.allsoldItems[ sold_key ]??0) + val["quantity"];
      })
      this.calculateTableHeight(); // Recalculate height after data loads
    });
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
    this.calculateTableHeight(); // Recalculate height after sort
  }

  // --- Dynamic Height Calculation Logic ---
  ngAfterViewInit(): void {
    // Only calculate height for standalone view and if customHeightClass is not set
    if (!this.isEmbeddedInFilteredContext && !this.customHeightClass) {
      this.calculateTableHeight(); // Calculate initial height
      this.setupResizeObserver(); // Set up observer for dynamic height
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(entries => {
      // For standalone view, recalculate height on resize
      if (!this.isEmbeddedInFilteredContext && !this.customHeightClass) {
        this.calculateTableHeight();
      }
    });
    // Observe the host element for size changes
    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  private calculateTableHeight(): void {
    // Only apply this logic for standalone view and if customHeightClass is not set
    if (!this.isEmbeddedInFilteredContext && !this.customHeightClass) {
      // Ensure view is initialized
      if (!this.virtualScrollViewport) {
        return;
      }

      const hostElement = this.elementRef.nativeElement;
      const filterControlsContainer = hostElement.querySelector('.filter-controls-container');
      const paginatorElement = hostElement.querySelector('.mat-paginator'); // Assuming paginator exists

      let elementsAboveTableHeight = 0;
      if (filterControlsContainer) {
        elementsAboveTableHeight += filterControlsContainer.offsetHeight;
      }
      if (paginatorElement) {
        // Only count if paginator is present, which it will be
        // Paginator's height is typically fixed
        // For accurate height, use getBoundingClientRect().height
        elementsAboveTableHeight += paginatorElement.offsetHeight;
      }

      // Get the available height of the host component
      const availableHeightOfHost = hostElement.offsetHeight;

      // Calculate the height that the virtual scroll viewport should take
      const finalHeight = availableHeightOfHost - elementsAboveTableHeight;

      // Ensure a minimum height to avoid collapsing too much
      const minAllowedHeight = 300; // Display roughly 5-7 rows
      
      // Apply height to the virtual scroll viewport
      this.renderer.setStyle(this.virtualScrollViewport.nativeElement, 'height', `${Math.max(finalHeight, minAllowedHeight)}px`);
    } else {
        // If embedded or has customHeightClass, ensure the style is reset or handled by CSS
        // This prevents interference if calculateTableHeight is called incorrectly
        if (this.virtualScrollViewport) {
             this.renderer.removeStyle(this.virtualScrollViewport.nativeElement, 'height');
        }
    }
  }
}
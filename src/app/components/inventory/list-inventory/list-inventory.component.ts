import { Component, Input, OnInit, AfterViewInit, ViewChild, OnChanges, SimpleChanges, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';

import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import * as XLSX from "xlsx";
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, shareReplay, first, startWith } from 'rxjs/operators';

import { DataService } from 'src/app/services/data.service';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { InventoryItem } from 'src/app/models/inoffice';
import * as InventoryActions from 'src/app/store/inventory/inventory.actions';
import { selectAllInventory, selectInventoryStatus } from 'src/app/store/inventory/inventory.selectors';
import * as InvoiceSoldItemsActions from 'src/app/store/invoice-sold-items/invoice-sold-items.actions';
import { selectAllInvoiceSoldItems } from 'src/app/store/invoice-sold-items/invoice-sold-items.selectors';
import { UserPreferenceService } from 'src/app/services/user-preference.service';

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

  isLoading = true;
  viewportHeight: string = ''; // Bound to [style.height] of the viewport
  private filterBarcodeSubject = new BehaviorSubject<string | null>(null);
  
  // Date range form
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  onlyAvailable = new FormControl(false);

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
    private cdr: ChangeDetectorRef, // Inject ChangeDetectorRef
    private userPreferenceService: UserPreferenceService // Inject UserPreferenceService
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
    // Load saved date range preference
    const savedRange = this.userPreferenceService.getInventoryDateRange();
    if (savedRange) {
      const start = savedRange.start ? new Date(savedRange.start) : null;
      const end = savedRange.end ? new Date(savedRange.end) : null;
      this.range.setValue({ start, end });
    }

    this.store.dispatch(InventoryActions.loadInventory());
    this.subscribeToInventoryStore();
    
    // If range was loaded, use it, otherwise default (handled in method)
    this.getInvoiceSoldItemsFromServer(
        this.range.controls['start'].value, 
        this.range.controls['end'].value
    );

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
      this.store.select(selectAllInvoiceSoldItems),
      this.filterBarcodeSubject.asObservable(),
      this.onlyAvailable.valueChanges.pipe(startWith(this.onlyAvailable.value))
    ]).pipe(
      map(([inventory, soldItems, filterBarcode, onlyAvail]) => {
        // First, aggregate sold items by key
        const aggregatedSoldItems: Record<string, number> = {};
        soldItems.forEach(val => {
          let sold_key = `${val.barcode}` 
                          + (typeof val.labeldate != 'undefined' ? `::${val.labeldate}` : '')
                          + (typeof val.brand != 'undefined' ? `::${val.brand}` : '');
          aggregatedSoldItems[sold_key] = (aggregatedSoldItems[sold_key] ?? 0) + val.quantity;
        });

        // Then map inventory with sold data
        return inventory.map(itemdetails => {
          let sold_key = `${itemdetails.barcode}` 
                        + (typeof itemdetails.labeleddate != 'undefined' ? `::${itemdetails.labeleddate}` : '')
                        + (typeof itemdetails.brand != 'undefined' ? `::${itemdetails.brand}` : '');
          let sold_items = aggregatedSoldItems[sold_key] ?? 0;
          let present_available_items = itemdetails.quantity - sold_items;
          return { ...itemdetails, sold:sold_items, qtyavailable: present_available_items };
        }).filter(item => {
          if (onlyAvail && item.qtyavailable <= 0) {
            return false;
          }

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

  onAddInventory() {
    this.router.navigate(['/addinventory']);
  }

  onCopyInventory(item: any) {
    this.router.navigate(['/addinventory'], { queryParams: { data: JSON.stringify(item), copy: 'true' } });
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

  onToggleAvailable() {
    this.calculateTableHeight();
  }

  prepare_inventory_row_from_excel(row1:Array<string>, rowtoinsert:Array<string>):any{
    var retVal:Record<string, string> = {}
    for(let i=0;i<row1.length;i++){
      retVal[row1 [ i ] ] = rowtoinsert[i]
    }
    return retVal;
  }

  onxlsxFileChange(evt: any) {
    const target: DataTransfer = <DataTransfer>(evt.target);
    let date1 = new Date();
    const year = date1.getFullYear();
    let month = date1.getMonth()+1;
    const day = date1.getDate();
    let formattedmonth = month < 10 ? `0${month}` : `${month}`;
    let formattedday = day < 10 ? `0${day}` : `${day}`;
    let todaydate = `${year}-${formattedmonth}-${formattedday}`;

    if (target.files.length > 1) {
      alert('Multiple files are not allowed');
      return;
    }
    else {
      const file = target.files[0];
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];
        let data:Array<Array<string>> = (XLSX.utils.sheet_to_json(ws, { header: 1 }));
        console.log(data);

        let itemsToDispatch: InventoryItem[] = [];
        for(let csvIndex=1;csvIndex<data.length; csvIndex++){
          // Skip empty rows
          if (!data[csvIndex] || data[csvIndex].length === 0) continue;
          
          let insert_record = this.prepare_inventory_row_from_excel(data[0], data[csvIndex])          
          
          let barcode = insert_record["barcode"] ?? insert_record["productname"];
          let labeleddate = insert_record["labeleddate"];
          
          if (!barcode || !labeleddate) {
            console.log(`skipping row number ${csvIndex}: empty barcode or labeldate`, insert_record);
            continue;
          }

          // Handle date format DD/MM/YYYY or YYYY-MM-DD
          let tr_labeleddate = String(labeleddate);
          if (tr_labeleddate.includes('/')) {
            const parts = tr_labeleddate.split('/');
            if (parts.length === 3) {
              if (parts[2].length === 4) { // DD/MM/YYYY
                tr_labeleddate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              } else if (parts[0].length === 4) { // YYYY/MM/DD
                tr_labeleddate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
              }
            }
          }

          const parseNum = (val: any) => {
            const num = Number(val);
            return isNaN(num) ? 0 : num;
          };

          const itemToDispatch: InventoryItem = {
              productname: String(insert_record["productname"] || ''),
              hsn: parseNum(insert_record["hsn"]),
              quantity: parseNum(insert_record["quantity"]),
              unit: String(insert_record["unit"] ?? 'Nos'),
              cp: parseNum(insert_record["cp"]),
              percentgst: parseNum(insert_record["percentgst"]),
              netcp: parseNum(insert_record["netcp"]),
              calculatedmrp: parseNum(insert_record["calculatedmrp"]),
              mrp: parseNum(insert_record["mrp"]),
              discount: parseNum(insert_record["discount"]),
              fixedprofit: parseNum(insert_record["fixedprofit"]),
              percentprofit: parseNum(insert_record["percentprofit"]),
              labeleddate: tr_labeleddate,
              vendor: String(insert_record["vendor"] ?? 'utsw'),
              brand: String(insert_record["brand"] ?? 'utsw'),
              shippingcost: parseNum(insert_record["shippingcost"]),
              barcode: String(barcode),
              qtyavailable: 0,
              sold: 0,
              netvalue: 0
          };
          itemsToDispatch.push(itemToDispatch);
        }
        this.store.dispatch(InventoryActions.uploadInventory({ items: itemsToDispatch }));
        // Reset the input value so the same file can be uploaded again
        evt.target.value = '';
      }
      reader.readAsBinaryString(file);
    }
  }

  downloadInventory() {
    const dataToExport = this.dataSource.data.map(item => {
      return {
        'productname': item.productname,
        'hsn': item.hsn,
        'quantity': item.qtyavailable, // Export current available quantity
        'unit': item.unit,
        'cp': item.cp,
        'percentgst': item.percentgst,
        'netcp': item.netcp,
        'calculatedmrp': item.calculatedmrp,
        'mrp': item.mrp,
        'discount': item.discount,
        'fixedprofit': item.fixedprofit,
        'percentprofit': item.percentprofit,
        'labeleddate': item.labeleddate,
        'vendor': item.vendor,
        'brand': item.brand,
        'shippingcost': item.shippingcost,
        'barcode': item.barcode
      };
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook: XLSX.WorkBook = { Sheets: { 'Inventory': worksheet }, SheetNames: ['Inventory'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    this.saveAsExcelFile(excelBuffer, 'Current_Inventory');
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName + '_' + new Date().getTime() + '.xlsx';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  filter_clicked() {
    this.userPreferenceService.setInventoryDateRange({
      start: this.range.controls['start'].value, 
      end: this.range.controls['end'].value
    });
    this.getInvoiceSoldItemsFromServer(this.range.controls['start'].value, this.range.controls['end'].value)
  }

  getInvoiceSoldItemsFromServer(startDate:Date|null=new Date(), endDate:Date|null=new Date()){
    let tr_start_date:string = this.datePipe.transform(startDate,'yyyy-MM-dd')??'2024-01-13';
    let tr_end_date:string = this.datePipe.transform(endDate,'yyyy-MM-dd')??'2099-01-13';
    
    this.store.dispatch(InvoiceSoldItemsActions.loadInvoiceSoldItems({ startDate: tr_start_date, endDate: tr_end_date }));
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
      this.viewportHeight = `${Math.max(finalHeight, minAllowedHeight)}px`;
      this.cdr.detectChanges(); // Force change detection to avoid NG0100
    } else {
        // If embedded or has customHeightClass, ensure the style is reset
        this.viewportHeight = '';
    }
  }
}
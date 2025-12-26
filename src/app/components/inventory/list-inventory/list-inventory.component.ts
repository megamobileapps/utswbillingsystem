import { Component, Input, OnInit, AfterViewInit, ViewChild, OnChanges, SimpleChanges} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from 'src/app/services/data.service';
import { InventoryService } from 'src/app/services/inventory.service';
import {MatSort, Sort, MatSortModule} from '@angular/material/sort';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatDatepicker } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';
import { InvoiceSoldItems } from 'src/app/models/invoice-data-item';
import { Router } from '@angular/router'; // Import Router


@Component({
  selector: 'app-list-inventory',
  templateUrl: './list-inventory.component.html',
  styleUrls: ['./list-inventory.component.css']
})
export class ListInventoryComponent implements OnInit,AfterViewInit,OnChanges  {

  
  @Input() barcode:string|null=null
  @Input() filterwithbarcode:string|null=null

  @ViewChild(MatPaginator) private paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  inventoryList:any=[]
  dataSource = new MatTableDataSource<string>(this.inventoryList);
  allsoldItems:Record<string, number> = {}
  constructor(private formBuilder: FormBuilder,
    private _dataService:DataService,
    private _inventoryService:InventoryService,
    private datePipe:DatePipe,
    private _liveAnnouncer: LiveAnnouncer, private dialog: MatDialog,
    private router: Router // Inject Router
  ){
    
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }    

  displayedColumns: string[] = [
    'productname',
    'barcode',
    'labeleddate',
    'hsn',
  'quantity',
  'sold',
  'qtyavailable',
  'unit',
  'cp', 
  'shippingcost',   
  'percentgst',
  'netcp',  
  'calculatedmrp', 
  'mrp',
  'fixedprofit',
  'percentprofit',  
  'vendor',
  'brand',  
  
  'delete',
  'edit', // Added for edit functionality
  ];
  

  ngOnInit(): void {
    
    this.getInvoiceSoldItemsFromServer();
  }

  readonly range = new FormGroup({
    start: new FormControl<Date | null>(new Date()),
    end: new FormControl<Date | null>(new Date()),
  });
  
  // convenience getter for easy access to form fields
  get fdaterange() { return this.range.controls; }

  filter_clicked() {
    this.getInvoiceSoldItemsFromServer(this.fdaterange['start'].value, this.fdaterange['end'].value)
  }
  getInvoiceSoldItemsFromServer(startDate:Date|null=new Date(), endDate:Date|null=new Date()){
    // let invoicedate = Date();
    let tr_start_date:string = this.datePipe.transform(startDate,'yyyy-MM-dd')??'2024-01-13';
    let tr_end_date:string = this.datePipe.transform(endDate,'yyyy-MM-dd')??'2099-01-13';
    
    console.log('getInvoiceSoldItemsFromServer() date of invoice sold items '+tr_start_date);
    this._dataService.getInvoiceSoldItemsFromServer(tr_start_date, tr_end_date).subscribe((d) => {       
      console.log('getInvoiceSoldItemsFromServer(): '+JSON.stringify(d));        
      d.forEach(val=>{
        let sold_key = `${val["barcode"]}` + (typeof val["labeldate"] != 'undefined' ? `::${val["labeldate"]}` : '')
                                            + (typeof val["brand"] != 'undefined' ? `::${val["brand"]}` : '');
        this.allsoldItems[ sold_key ]= (this.allsoldItems[ sold_key ]??0) + val["quantity"];
        //
        // this.allsoldItems[ val["barcode"] ]=val["quantity"]
    })
      this.getAllInventory();
    });
   }

  getAllInventory(filterwith=''){
    let self = this;
     this._inventoryService.getAllInventory().subscribe(data => { 
       console.log('getAllInventory(): step 1', JSON.stringify(data));
      var rcvddata = [];
       for(const itemWrapper of data) {
         if (itemWrapper && itemWrapper.itemdetails) {
            let itemdetails = itemWrapper.itemdetails;
            
            // Apply barcode filter if present
            if ((this.filterwithbarcode != null && itemdetails['barcode'] == this.filterwithbarcode) || (filterwith != '' && itemdetails['barcode'] == filterwith)) {
              let sold_key = `${itemdetails["barcode"]}` 
                            + (typeof itemdetails["labeleddate"] != 'undefined' ? `::${itemdetails["labeleddate"]}` : '')
                            + (typeof itemdetails["brand"] != 'undefined' ? `::${itemdetails["brand"]}` : '');
              let sold_items = this.allsoldItems[sold_key]??0
              let present_available_items = itemdetails["quantity"] - sold_items
              rcvddata.push( { ...itemdetails, sold:sold_items, qtyavailable: present_available_items } ); 
            } else if (this.filterwithbarcode == null && filterwith == ''){
                // If no barcode filter, add all items
                let sold_key = `${itemdetails["barcode"]}` 
                            + (typeof itemdetails["labeleddate"] != 'undefined' ? `::${itemdetails["labeleddate"]}` : '')
                            + (typeof itemdetails["brand"] != 'undefined' ? `::${itemdetails["brand"]}` : '');
                let sold_items = this.allsoldItems[sold_key]??0
                let present_available_items = itemdetails["quantity"] - sold_items
                rcvddata.push( { ...itemdetails, sold:sold_items, qtyavailable: present_available_items } ); 
            }
         }
       }
         this.dataSource.data = rcvddata;
         console.log('getAllInventory(): Data after filling ', JSON.stringify(rcvddata));
       
     });
   }

   openDialogForDeleteConfirmation(event:any, item:any) {
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
        // Clicked on delete
        console.log('Clicked on confirmed');      
        this._inventoryService.deleteInventory(item).then((res) => {
          console.log('openDialogForDeleteConfirmation: ',res);    
          alert('Successfully deleted');
        })
        .catch((err) => {
          console.log('openDialogForDeleteConfirmation error: ' + err);
          alert('Error while openDialogForDeleteConfirmation');        
        });
        
      }else {
        // Cancelled
        console.log('Cancelled click')
      }
    });
  }
  
  onEditInventory(item: any) {
    this.router.navigate(['/addinventory'], { queryParams: { data: JSON.stringify(item) } });
  }

   
   ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    console.log('ListInventoryComponent:ngOnChanges()'+JSON.stringify(changes));
    this.getAllInventory(changes["filterwithbarcode"]["currentValue"]);
  }
   /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}

import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild, numberAttribute } from '@angular/core';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import { InventoryService } from 'src/app/services/inventory.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { InvoiceDataItem } from 'src/app/models/invoice-data-item';
import { InventoryItem } from 'src/app/models/inoffice';
import { UTSWCartItem } from 'src/app/models/cart-item';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.css']
})
export class BillComponent implements OnInit,AfterViewInit,OnChanges  {

  
  @Input() barcode:string|null=null
  @Input() filterwithbarcode:string|null=null

  @ViewChild(MatPaginator) private paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  invoicelist:Array<any>=[]
  inventoryList:any=[]
  dataSource = new MatTableDataSource<InvoiceDataItem>(this.invoicelist);
  totalInvoice:{count:number, amount:number} = {count:0,amount:0} 
  constructor(private formBuilder: FormBuilder,
    private _dataService:DataService,
    private _inventoryService:InventoryService,
    private _liveAnnouncer: LiveAnnouncer, private dialog: MatDialog,
    private datePipe:DatePipe,
    private router:Router
  ){
    
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }    

  displayedColumns:string[] = [
        "id",
        "username",
        "amount",
        "phonenumber",
        "emailid",
        "invoicenumber",
        "invoicedate",
        "discount",
        "payment_method",
        "edit"
  ]
  ;
  // displayedColumns: string[] = [
  //   'productname',
  //   'barcode',
  //   'labeleddate',
  //   'hsn',
  // 'quantity',
  // 'unit',
  // 'cp', 
  // 'shippingcost',   
  // 'percentgst',
  // 'netcp',  
  // 'calculatedmrp', 
  // 'mrp',
  // 'fixedprofit',
  // 'percentprofit',  
  // 'vendor',
  // 'brand',  
  // 'delete',
  // ];
  

  ngOnInit(): void {
    // this.getAllInventory();
    this.getInvoiceDataFromServer();
  }

  readonly range = new FormGroup({
    start: new FormControl<Date | null>(new Date()),
    end: new FormControl<Date | null>(new Date()),
  });
  
  // convenience getter for easy access to form fields
  get fdaterange() { return this.range.controls; }

  filter_clicked() {
    this.getInvoiceDataFromServer(this.fdaterange['start'].value, this.fdaterange['end'].value)
  }
  
  // getAllInventory(filterwith=''){
  //   let self = this;
  //    this._inventoryService.getAllInventory().subscribe(data => { 
  //      console.log('getAllInventory(): step 1', JSON.stringify(data));
  //     //  self.inventoryList=[];
  //     var rcvddata=[];
  //      for(let i=0;i<data.length;i++){
  //        console.log('getAllInventory(): step 2', JSON.stringify(data[i]));
  //        let datekeys = Object.keys(data[i])
  //        console.log('getAllInventory(): filter value is '+this.filterwithbarcode);
  //        if (this.filterwithbarcode != null || filterwith != ''){
  //         if (typeof data[i][datekeys[0]].itemdetails != 'undefined')
  //           if(data[i][datekeys[0]].itemdetails['barcode'] == this.filterwithbarcode??filterwith)
  //             for (let datekeyindex=0;datekeyindex<datekeys.length; datekeyindex++)
  //               rcvddata.push( data[i][datekeys[datekeyindex]].itemdetails ); 
  //        }else{
  //         for (let datekeyindex=0;datekeyindex<datekeys.length; datekeyindex++){
  //             if (typeof data[i][datekeys[datekeyindex]].itemdetails != 'undefined')
  //               rcvddata.push( data[i][datekeys[datekeyindex]].itemdetails ); 
  //         }
  //             // rcvddata.push( data[i][datekeys[0]].itemdetails );        
  //        }
  //        }
  //        this.dataSource.data = rcvddata;
  //        console.log('getAllInventory(): Data after filling ', JSON.stringify(rcvddata));
       
  //    });
  //  }

   //getInvoiceDataFromServer
   getInvoiceDataFromServer(startDate:Date|null=new Date(), endDate:Date|null=new Date()){
    // let invoicedate = Date();
    let tr_start_date:string = this.datePipe.transform(startDate,'yyyy-MM-dd')??'2024-01-13';
    let tr_end_date:string = this.datePipe.transform(endDate,'yyyy-MM-dd')??'2024-01-13';
    
    console.log('getInvoiceDataFromServer() date of invoice '+tr_end_date);
    this._dataService.getInvoiceDataFromServer(tr_start_date, tr_end_date).subscribe((d) => { 
      this.invoicelist = d; 
      console.log('getInvoiceDataFromServer(): '+JSON.stringify(d));  
      this.dataSource.data = d;     
      this.totalInvoice.count = d.length;
      this.totalInvoice.amount = 0;
      d.forEach(val=>this.totalInvoice.amount+=Number.parseFloat(val.amount.toString()))
    });
   }

   openDialogForEditConfirmation(event:any, item:any) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent,{
      data:{
        message: 'Are you sure want to Edit this Invoice Data?',
        buttonText: {
          ok: 'Edit',
          cancel: 'Cancel'
        }
      }
    });
    

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {  
        // Clicked on delete
        console.log('Clicked on confirmed'); 
        this.router.navigate(['/catalogue'] ,
          { queryParams: { oldinvoiceid: item.invoicenumber } });     

        // this._inventoryService.deleteInventory(item).then((res) => {
        //   console.log('openDialogForEditConfirmation: ',res);    
        //   alert('Successfully deleted');
        // })
        // .catch((err) => {
        //   console.log('openDialogForEditConfirmation error: ' + err);
        //   alert('Error while openDialogForEditConfirmation');        
        // });
        
      }else {
        // Cancelled
        console.log('Cancelled click inside openDialogForEditConfirmation')
      }
    });
    
  }
  
   row_click_event(event:InvoiceDataItem){
    console.log('row_click_event() row event '+JSON.stringify(event));
    var invData = event.invoicedata;
    var invData1:Array<UTSWCartItem> = JSON.parse(invData);
    if (typeof invData1 == 'string') {
      invData1 = JSON.parse(invData1);
    }
    console.log('invdata'+invData1);
    var dataToShow:Array<any> = [];
    invData1.forEach(element => {
      let tmpVal = {
        productName:element.productName,
        quantity:element.quantity,
        totalprice:element.productPrice*element.quantity
      };
      dataToShow.push(tmpVal);
      
    });

    console.log('Decoded Items in Invoice are '+JSON.stringify(dataToShow));
    const dialogRef = this.dialog.open(ConfirmationDialogComponent,{
      data:{
        message: JSON.stringify(dataToShow, null,4),
        buttonText: {
          ok: 'OK',
          cancel: 'Cancel'
        }
      }
    });
    

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {  
        // Clicked on delete
       console.log('Clicked on confirmed');      
      }else {
        // Cancelled
        console.log('Cancelled click')
      }
    });
   }
   ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    console.log('ListInventoryComponent:ngOnChanges()'+JSON.stringify(changes));
    // this.getAllInventory(changes["filterwithbarcode"]["currentValue"]);
    this.getInvoiceDataFromServer();
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
}

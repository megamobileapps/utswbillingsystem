import { Component, Input, OnInit, AfterViewInit, ViewChild, OnChanges, SimpleChanges} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from 'src/app/services/data.service';
import { InventoryService } from 'src/app/services/inventory.service';
import {MatSort, Sort, MatSortModule} from '@angular/material/sort';
import {LiveAnnouncer} from '@angular/cdk/a11y';


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
  constructor(private formBuilder: FormBuilder,
    private _dataService:DataService,
    private _inventoryService:InventoryService,
    private _liveAnnouncer: LiveAnnouncer
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
  ];
  

  ngOnInit(): void {
    this.getAllInventory();
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
              if (typeof data[i][datekeys[datekeyindex]].itemdetails != 'undefined')
                rcvddata.push( data[i][datekeys[datekeyindex]].itemdetails ); 
          }
              // rcvddata.push( data[i][datekeys[0]].itemdetails );        
         }
         }
         this.dataSource.data = rcvddata;
         console.log('getAllInventory(): Data after filling ', JSON.stringify(rcvddata));
       
     });
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
}

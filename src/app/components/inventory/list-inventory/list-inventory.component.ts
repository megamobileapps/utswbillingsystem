import { Component, Input, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DataService } from 'src/app/services/data.service';
import { InventoryService } from 'src/app/services/inventory.service';
import {MatSort, Sort, MatSortModule} from '@angular/material/sort';
import {LiveAnnouncer} from '@angular/cdk/a11y';
export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}
const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

@Component({
  selector: 'app-list-inventory',
  templateUrl: './list-inventory.component.html',
  styleUrls: ['./list-inventory.component.css']
})
export class ListInventoryComponent implements OnInit,AfterViewInit {

  
  @Input() barcode:string|null=null
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
  'netcp',
  'percentgst',
  'mrp',
  'calculatedmrp', 
  'fixedprofit',
  'percentprofit',  
  'vendor',
  'brand',
  'shippingcost',
  ];
  

  ngOnInit(): void {
    this.getAllInventory();
  }

  getAllInventory(){
    let self = this;
     this._inventoryService.getAllInventory().subscribe(data => { 
       console.log('getAllInventory(): step 1', JSON.stringify(data));
      //  self.inventoryList=[];
      var rcvddata=[];
       for(let i=0;i<data.length;i++){
         console.log('getAllInventory(): step 2', JSON.stringify(data[i]));
         let datekeys = Object.keys(data[i])
         rcvddata.push( data[i][datekeys[0]].itemdetails );        
         }
         this.dataSource.data = rcvddata;
         console.log('getAllInventory(): Data after filling ', JSON.stringify(rcvddata));
       
     });
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

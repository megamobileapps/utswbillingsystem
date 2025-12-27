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
import * as XLSX from 'xlsx';
import { Store } from '@ngrx/store';
import * as BillActions from 'src/app/store/bill/bill.actions';
import { selectAllBills, selectBillStatus } from 'src/app/store/bill/bill.selectors';

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
  isLoading = true;

  constructor(private formBuilder: FormBuilder,
    private _inventoryService:InventoryService,
    private _liveAnnouncer: LiveAnnouncer, private dialog: MatDialog,
    private datePipe:DatePipe,
    private router:Router,
    private store: Store
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
        "actions"
  ]
  ;
  
  ngOnInit(): void {
    this.subscribeToBillStore();
    this.getInvoiceDataFromServer();
  }

  subscribeToBillStore(): void {
    this.store.select(selectBillStatus).subscribe(status => {
      this.isLoading = status === 'loading';
    });

    this.store.select(selectAllBills).subscribe(bills => {
      this.invoicelist = bills;
      this.dataSource.data = bills;
      this.totalInvoice.count = bills.length;
      this.totalInvoice.amount = 0;
      bills.forEach(val => this.totalInvoice.amount += Number.parseFloat(Number(val.amount).toString()));
    });
  }

  readonly range = new FormGroup({
    start: new FormControl<Date | null>(new Date()),
    end: new FormControl<Date | null>(new Date()),
  });
  
  get fdaterange() { return this.range.controls; }

  filter_clicked() {
    this.getInvoiceDataFromServer(this.fdaterange['start'].value, this.fdaterange['end'].value)
  }
  
   getInvoiceDataFromServer(startDate:Date|null=new Date(), endDate:Date|null=new Date()){
    let tr_start_date:string = this.datePipe.transform(startDate,'yyyy-MM-dd')??'2024-01-13';
    let tr_end_date:string = this.datePipe.transform(endDate,'yyyy-MM-dd')??'2024-01-13';
    
    this.store.dispatch(BillActions.loadBills({ startDate: tr_start_date, endDate: tr_end_date }));
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
        this.router.navigate(['/catalogue'] ,
          { queryParams: { oldinvoiceid: item.invoicenumber } });     
      }
    });
  }

  openBillDetails(invoice: InvoiceDataItem): void {
    this.router.navigate(['/bills/details', invoice.invoicenumber]);
  }
  
   ngOnChanges(changes: SimpleChanges) {
    this.getInvoiceDataFromServer();
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  // GST Report Generation
  private getTaxableAmount(price: number, gstRate: number): number {
    return price / (1 + gstRate / 100);
  }

  private s2ab(s: string): ArrayBuffer {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  }

  private saveAsExcel(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  }

  generateB2CSReport(): void {
    const b2csData: { [key: number]: { taxableValue: number, rate: number, cess: number } } = {};

    this.invoicelist.forEach(invoice => {
      try {
        let items: UTSWCartItem[] = JSON.parse(invoice.invoicedata);
        if (typeof items === 'string') items = JSON.parse(items);

        items.forEach(item => {
          const rate = item.gst ?? 0;
          if (b2csData[rate] === undefined) {
            b2csData[rate] = { taxableValue: 0, rate: rate, cess: 0 };
          }
          const itemTotal = item.quantity * item.productPrice;
          const taxableValue = this.getTaxableAmount(itemTotal, rate);
          b2csData[rate].taxableValue += taxableValue;
        });
      } catch (e) {
        console.error('Could not parse invoicedata for B2CS report', invoice);
      }
    });

    const reportData = Object.values(b2csData).map(d => ({
      'Rate': d.rate,
      'Taxable Value': d.taxableValue.toFixed(2),
      'Cess Amount': d.cess.toFixed(2),
      'Type': 'OE',
      'Place Of Supply': '29-KARNATAKA'
    }));

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = { Sheets: { 'B2CS': worksheet }, SheetNames: ['B2CS'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
    this.saveAsExcel(this.s2ab(excelBuffer), 'B2CS_Report.xlsx');
  }

  generateHSNReport(): void {
    const hsnData: { [key: string]: { hsn: string, desc: string, uqc: string, qty: number, total: number, taxable: number, igst: number, cgst: number, sgst: number, cess: number } } = {};

    this.invoicelist.forEach(invoice => {
      try {
        let items: UTSWCartItem[] = JSON.parse(invoice.invoicedata);
        if (typeof items === 'string') items = JSON.parse(items);

        items.forEach(item => {
          const hsn = (item.hsn ?? '49011010').toString();
          const gstRate = item.gst ?? 0;

          if (hsnData[hsn] === undefined) {
            const description = hsn === '49011010' 
              ? 'ED BOOKS, BROCHURES, LEAFLETS AND SIMILAR ED MATTER, WHETHER OR NOT IN SINGLE SHEETS IN SINGLE SHEETS, WHETHER OR NOT FOLDED : ED BOOKS'
              : item.productName as string;

            hsnData[hsn] = {
              hsn: hsn,
              desc: description,
              uqc: (item.unitTag as string) || 'NOS',
              qty: 0, total: 0, taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0
            };
          }

          const itemTotal = item.quantity * item.productPrice;
          const taxableValue = this.getTaxableAmount(itemTotal, gstRate);
          const gstAmount = itemTotal - taxableValue;

          hsnData[hsn].qty += item.quantity;
          hsnData[hsn].total += itemTotal;
          hsnData[hsn].taxable += taxableValue;
          hsnData[hsn].cgst += gstAmount / 2;
          hsnData[hsn].sgst += gstAmount / 2;
        });
      } catch (e) {
        console.error('Could not parse invoicedata for HSN report', invoice);
      }
    });
    
    const reportData = Object.values(hsnData).map(d => ({
      'HSN': d.hsn,
      'Description': d.desc,
      'UQC': d.uqc,
      'Total Quantity': d.qty,
      'Total Value': d.total.toFixed(2),
      'Taxable Value': d.taxable.toFixed(2),
      'Integrated Tax Amount': d.igst.toFixed(2),
      'Central Tax Amount': d.cgst.toFixed(2),
      'State/UT Tax Amount': d.sgst.toFixed(2),
      'Cess Amount': d.cess.toFixed(2)
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = { Sheets: { 'hsn': worksheet }, SheetNames: ['hsn'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
    this.saveAsExcel(this.s2ab(excelBuffer), 'HSN_Report.xlsx');
  }
}

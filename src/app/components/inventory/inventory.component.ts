import { Component, Inject, Input, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';
import { CartDetails } from 'src/app/providers/cart.details';
import { CartService } from 'src/app/providers/cart.provider';
import { DataService } from 'src/app/services/data.service';
import { InventoryService } from 'src/app/services/inventory.service';
import * as XLSX from "xlsx";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SoldItemSummary } from '../sold-items-summary/sold-items-summary.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { google_web_search } from 'src/app/tools/google_web_search';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ]
})
export class InventoryComponent implements OnInit {
  @Input() barcode:string|null=null
  deliveryForm: FormGroup;
  options: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  isMobileScreen:boolean=false;
  todaydate='';
  hsnLoading = false;
  isBarcodeFromInput = false;
  isBarcodeEditable = false;

  constructor(private formBuilder: FormBuilder,
    private _dataService:DataService,
    private _inventoryService:InventoryService,
    private _cartService:CartService,private router: Router, private route: ActivatedRoute,
    @Optional() public dialogRef: MatDialogRef<InventoryComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: SoldItemSummary
    ) {
      let date1 = new Date();
      const year = date1.getFullYear();
      let month = date1.getMonth()+1;
      const day = date1.getDate();
      let formattedmonth:string='';
      let formattedday:string='';
      if (month<10){
        formattedmonth=`0${month}`
      } else{
        formattedmonth=`${month}`
      }
      if (day<10){
        formattedday=`0${day}`
      } else{
        formattedday=`${day}`
      }
      
      this.todaydate = `${year}-${formattedmonth}-${formattedday}`;
      this.deliveryForm = this.formBuilder.group({
        grade: ['ZM4', Validators.required],       
        gradelevel2: ['ZM4'],
        subId: [''],
        barcode: [''],
        subject: ['subject name'],
        pcost: [''],
        discount: ['0'],
        inventory: ['100'],
        subposition: ['100'],
        netvalue: ['9999'],
        gst: ['0'],
        quantity: ['100'],
        total: ['99999'],
        hsn: ['49011010']
      });

      this.options = this.formBuilder.group({
        productname:['abc'],
        hsn: ['49011010'],
        quantity: ['1'],
        unit: ['Nos'],
        cp: ['0'],
        percentgst: ['0'],
        netcp: ['0'],
        calculatedmrp: ['0'],
        mrp: ['0'],
        fixedprofit: ['0'],
        percentprofit: ['0'],
        labeleddate: [this.todaydate],
        vendor: ['abc'],
        brand: ['abc'],
        shippingcost: ['0'],
        barcode: ['', Validators.required]
      });
     }
    

  get f() { return this.deliveryForm.controls; }
  get f2() { return this.options.controls; }

  get getFormData():any{
    return {
      grade: this.f['grade'].value,       
        gradelevel2: this.f['gradelevel2'].value,
        subId: this.f['subId'].value,
        barcode: this.f['barcode'].value,
        subject: this.f['subject'].value,
        pcost: this.f['pcost'].value,
        discount: this.f['discount'].value,
        inventory: this.f['inventory'].value,
        subposition: this.f['subposition'].value,
        netvalue: this.f['netvalue'].value,
        gst: this.f['gst'].value,
        quantity: this.f['quantity'].value,
        total: this.f['total'].value,
        hsn: this.f['hsn'].value
    };
  }
  get getInventoryFormData():any{
    return {
        productname: this.f2['productname'].value,   
        hsn: this.f2['hsn'].value,       
        quantity: this.f2['quantity'].value,
        unit: this.f2['unit'].value,
        cp: this.f2['cp'].value,
        percentgst: this.f2['percentgst'].value,
        netcp: this.f2['netcp'].value,
        calculatedmrp: this.f2['calculatedmrp'].value,
        mrp: this.f2['mrp'].value,
        fixedprofit: this.f2['fixedprofit'].value,
        percentprofit: this.f2['percentprofit'].value,
        labeleddate: this.f2['labeleddate'].value,
        vendor: this.f2['vendor'].value,
        brand: this.f2['brand'].value,
        shippingcost: this.f2['shippingcost'].value,
        barcode: this.f2['barcode'].value
    };
  }

  calculateCPMRPProfit(){
    let fd = this.getInventoryFormData;
    var cp_plus_shipping = Number(fd["cp"]) + Number(fd["shippingcost"]);
    var netcp = Number(fd["cp"]) *( (100+ Number(fd["percentgst"]))/100) + Number(fd["shippingcost"]);
    var calMRP = netcp*2 - Number(fd["shippingcost"]);
    var MRP = calMRP;

    var MRP_wo_GST = MRP/(1+Number(fd["percentgst"])/100);
    var fixedProfit = MRP_wo_GST - (cp_plus_shipping);
    var percentProfit = fixedProfit*100/cp_plus_shipping;

    this.options.patchValue({
      netcp: netcp, 
      calculatedmrp:calMRP,
      mrp:MRP,
      fixedprofit:fixedProfit,
      percentprofit :percentProfit
    });
  }

  async ngOnInit(): Promise<void> {
    const barcodeFromInput = this.barcode;
    const barcodeFromData = this.data?.productId;

    if (barcodeFromInput) {
      this.isBarcodeFromInput = true;
      this.options.patchValue({ barcode: barcodeFromInput });
    } else if (barcodeFromData) {
      this.isBarcodeFromInput = true;
      this.options.patchValue({ barcode: barcodeFromData });
    }

    if (this.data) {
      this.options.patchValue({
        productname: this.data.productName,
        cp: this.data.price,
        mrp: this.data.price
      });
      if (this.data.productName) {
        await this.fetchHsnCode(this.data.productName);
      }
    }
  }

  editBarcode(): void {
    this.isBarcodeEditable = true;
  }

  async fetchHsnCode(productName: string): Promise<void> {
    this.hsnLoading = true;
    try {
      const result = await google_web_search({ query: `HSN code for ${productName}` });
      if (result && result.results.length > 0) {
        const snippets = result.results.map((r: { snippet: string }) => r.snippet).join(' ');
        const hsnMatch = snippets.match(/\b\d{8}\b/);
        if (hsnMatch) {
          this.options.patchValue({ hsn: hsnMatch[0] });
        }
      }
    } catch (error) {
      console.error('Error fetching HSN code:', error);
    } finally {
      this.hsnLoading = false;
    }
  }

  onSubmit() {
    console.log("Submitting payment form in cart component");
    this.submitted = true;

    if (this.deliveryForm.invalid) {
      console.log("inventory form is invalid");
        return;
    }

    this.loading = true;
    var formData = this.getFormData;
    var data = { 
                "posoperation":"additem",
                "itemdetails":formData};

    
    this._dataService.addItem(data).pipe(first())
    .subscribe(
        data => {
          
          alert('Inventory is sent to the Center');
        },
        error => {
            this.error = error;
            console.log("Inventory component: Error in submitting to service ", error);
            
        });

    this.router.navigate(['/']);
  }

  onSubmitFire(){
    console.log('onSubmitFire called');
    this.submitted = true;
    if (this.options.invalid) {
      console.log("inventory options form is invalid");
        return;
    }

    this.loading = true;
    var formData = this.getInventoryFormData;
    var data = {"itemdetails":formData, id:formData["barcode"]+'/'+formData["labeleddate"]};

    this._inventoryService.addInventory(data).then((res) => {
      console.log('Inventory onSubmitFire(): ',res);   
      alert('inventory is added successfully');
      if (this.dialogRef) {
        this.dialogRef.close();
      }
    })
    .catch((err) => {
      console.log('Inventory onSubmitFire() error: ' + err);
      alert('Error while Inventory onSubmitFire()');        
    });    
  }

  onClose(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  get currentCart():CartDetails|undefined|null{
    return this._cartService.currentCart;
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
    let formattedmonth:string='';
    let formattedday:string='';
    if (month<10){
      formattedmonth=`0${month}`
    } else{
      formattedmonth=`${month}`
    }
    if (day<10){
      formattedday=`0${day}`
    } else{
      formattedday=`${day}`
    }
    
    this.todaydate = `${year}-${formattedmonth}-${formattedday}`;

    if (target.files.length > 1) {
      alert('Multiple files are not allowed');
      return;
    }
    else {
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];
        let data:Array<Array<string>> = (XLSX.utils.sheet_to_json(ws, { header: 1 }));
        console.log(data);

        let data_to_push:Array<Record<string, string>> = [];
        for(let csvIndex=1;csvIndex<data.length; csvIndex++){
          if (data[csvIndex].length != 16 ){
            console.log(`skipping row number ${csvIndex}`)
            continue;
          }
          let insert_record = this.prepare_inventory_row_from_excel(data[0], data[csvIndex])          
          console.log(`onxlsxFileChange()  value ${insert_record}`);          
          data_to_push.push(insert_record);
        }
        console.log('data to push to db for inventory  is '+`${data_to_push}`)
        data_to_push.forEach((m_value, m_key)=>{    
          if (m_value["labeleddate"]==''){
            m_value["labeleddate"]=this.todaydate;
          }   
          if(m_value["barcode"]==''){
            m_value["barcode"]=m_value["productname"];
          }
          if (m_value["barcode"] == '' || m_value["labeleddate"] == '') {
            console.log('empty barcode and labeldate is not allowed')
          } else {
            var data = {"itemdetails":m_value, id:m_value["barcode"]+'/'+m_value["labeleddate"]};
            this._inventoryService.addInventory(data).then((res) => {
              console.log('Inventory onSubmitFire(): ',res);   
            })
            .catch((err) => {
              console.log('Inventory onSubmitFire() error: ' + err);
              alert('Error while Inventory onSubmitFire()');        
            });    
          }
         });
      }
      reader.readAsBinaryString(target.files[0]);
    }
  }
}
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';
import { CartDetails } from 'src/app/providers/cart.details';
import { CartService } from 'src/app/providers/cart.provider';
import { DataService } from 'src/app/services/data.service';
import { ReceiptDetailsComponent } from '../receipt.details/receipt.details.component';
import { InventoryService } from 'src/app/services/inventory.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
  @Input() barcode:string|null=null
  deliveryForm: FormGroup;
  options: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  isMobileScreen:boolean=false;

  constructor(private formBuilder: FormBuilder,
    private _dataService:DataService,
    private _inventoryService:InventoryService,
    private _cartService:CartService,private router: Router, private route: ActivatedRoute) {
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
        labeleddate: ['2023-01-29'],
        vendor: ['abc'],
        brand: ['abc'],
        shippingcost: ['0'],
      });
     }
    

  get f() { return this.deliveryForm.controls; }
  get f2() { return this.options.controls; }

  /*
   id: '',
          grade: f['grade']!.value.toString(),
          gradelevel2: f['gradelevel2']!.value.toString(),
          subId: f['subId']!.value.toString(),
          barcode: f['barcode']!.value.toString(),
          subject: f['subject']!.value.toString(),
          pcost: f['pcost']!.value.toString(),
          discount: f['discount']!.value.toString(),
          inventory: f['inventory']!.value.toString(),
          subposition: f['subposition']!.value.toString(),
          netvalue: 1,
          gst: int.parse(f['gst']!.value.toString()),
          quantity: 1,
          total: 1,
          hsn: int.parse(f['hsn']!.value.toString()));
  */
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
        barcode:this.barcode
    };
  }

  calculateCPMRPProfit(){
    let fd = this.getInventoryFormData;
    var netcp = Number(fd["cp"]) *( (100+ Number(fd["percentgst"]))/100) + Number(fd["shippingcost"]);
    // double of netcp - shipping cost
    var calMRP = netcp*2 - Number(fd["shippingcost"]);
    var MRP = calMRP;

    //profit will be mrp - %GST
    // mrp = mrp_wo_gst(1+GST)
    var MRP_wo_GST = MRP/(1+Number(fd["percentgst"])/100);
    var fixedProfit = MRP_wo_GST - netcp;
    var percentProfit = fixedProfit*100/MRP_wo_GST;

    this.options.patchValue({
      netcp: netcp, 
      calculatedmrp:calMRP,
      mrp:MRP,
      fixedprofit:fixedProfit,
      percentprofit :percentProfit
    });
  }
  ngOnInit(): void {
  }

  onSubmit() {
    console.log("Submitting payment form in cart component");
    this.submitted = true;

    // stop here if form is invalid
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

    console.log('coming before routing to Home');
    this.router.navigate(['/']);
  }

  onSubmitFire(){
    console.log('onSubmitFire called');
    console.log("Submitting payment form in cart component");
    this.submitted = true;
    // stop here if form is invalid
    if (this.options.invalid) {
      console.log("inventory options form is invalid");
        return;
    }

    this.loading = true;
    var formData = this.getInventoryFormData;
    //
    // key will be barcode/labeleddate to have multiple entries under same barcode
    //
    var data = {"itemdetails":formData, id:formData["barcode"]+'/'+formData["labeleddate"]};
                //_inventoryService
    this._inventoryService.addInventory(data).then((res) => {
      console.log('Inventory onSubmitFire(): ',res);   
      alert('inventory is added successfully')     
    })
    .catch((err) => {
      console.log('Inventory onSubmitFire() error: ' + err);
      alert('Error while Inventory onSubmitFire()');        
    });    
    console.log('coming before routing to Home');
    // this.router.navigate(['/']);
  }

  get currentCart():CartDetails|undefined|null{
    return this._cartService.currentCart;
  }

}

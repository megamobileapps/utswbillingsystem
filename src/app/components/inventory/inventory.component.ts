import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';
import { CartDetails } from 'src/app/providers/cart.details';
import { CartService } from 'src/app/providers/cart.provider';
import { DataService } from 'src/app/services/data.service';
import { ReceiptDetailsComponent } from '../receipt.details/receipt.details.component';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {

  deliveryForm: FormGroup;
  loading = false;
    submitted = false;
    error = '';
    isMobileScreen:boolean=false;
  constructor(private formBuilder: FormBuilder,
    private _dataService:DataService,
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
     }
  get f() { return this.deliveryForm.controls; }

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

  get currentCart():CartDetails|undefined|null{
    return this._cartService.currentCart;
  }

}

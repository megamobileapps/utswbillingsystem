import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CartDetails } from 'src/app/providers/cart.details';
import { CartService } from 'src/app/providers/cart.provider';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  deliveryForm: FormGroup;
  loading = false;
    submitted = false;
    error = '';
    isMobileScreen:boolean=false;
  constructor(private formBuilder: FormBuilder,
    private _cartService:CartService,private router: Router, private route: ActivatedRoute) {
      this.deliveryForm = this.formBuilder.group({
        cPayname: ['', Validators.required],       
        cPayMobile: ['', [Validators.required,Validators.pattern("[1-9]{1}[0-9]{9}$")]],
        cPayEmail: [''],
        payment_method:['SBIQR'],        
      });
     }
  get f() { return this.deliveryForm.controls; }

  get getFormData():any{
    return {
      cPayname:this.f['cPayname'].value,
      cPayMobile:this.f['cPayMobile'].value,
      cPayEmail:this.f['cPayEmail'].value,
      payment_method:this.f['payment_method'].value
    };
  }
  ngOnInit(): void {
  }

  onSubmit() {
    console.log("Submitting payment form in cart component");
    this.submitted = true;

    // stop here if form is invalid
    if (this.deliveryForm.invalid) {
      console.log("Payment form is invalid");
        return;
    }

    this.loading = true;
    var data = this.getFormData;

    this.currentCart!.username = data.cPayname?data.cPayname:'';
    this.currentCart!.phonenumber = data.cPayname?data.cPayMobile:'';
    this.currentCart!.emailid = data.cPayname?data.cPayEmail:'';
    this.currentCart!.payment_method = data.cPayname?data.payment_method:'';

    console.log('coming before routing to receipt');
    this.router.navigate(['/receipt']);
  }

  get currentCart():CartDetails|undefined|null{
    return this._cartService.currentCart;
  }

  get customerName():String|null|undefined{
    return this._cartService.currentCart?.username;
  }

  get customerPh():String|null|undefined{
    return this._cartService.currentCart?.phonenumber;
  }

  get payment_method():String|null|undefined{
    return this._cartService.currentCart?.payment_method;
  }
}

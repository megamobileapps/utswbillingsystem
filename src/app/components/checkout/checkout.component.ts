import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CartDetails } from 'src/app/providers/cart.details';
import { CartService } from 'src/app/providers/cart.provider';
import { DataService } from 'src/app/services/data.service';
import { CustomerSummary } from 'src/app/models/customer';

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
  isMobileScreen: boolean = false;
  discountPctInput: string = '';
  discountValInput: string = '';
  customerSuggestions$: Observable<CustomerSummary[]> = of([]);

  constructor(
    private formBuilder: FormBuilder,
    private _cartService: CartService,
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.deliveryForm = this.formBuilder.group({
      cPayname: ['', Validators.required],
      cPayMobile: ['', [Validators.required, Validators.pattern("[1-9]{1}[0-9]{9}$")]],
      cPayEmail: ['pk@pk.pk'],
      cDiscount: [''],
      cDiscountVal: [''],
      payment_method: ['Gpay'],
    });
  }

  get f() { return this.deliveryForm.controls; }

  onPctInput(val: string) {
    if (!this.currentCart) return;
    const numVal = val ? Number(val) : 0;
    this.currentCart.discount = (this._cartService.totalAmount * numVal) / 100;
    this.discountValInput = this.currentCart.discount > 0 ? (Math.round(this.currentCart.discount * 100) / 100).toString() : '';
  }

  onValInput(val: string) {
    if (!this.currentCart) return;
    const numVal = val ? Number(val) : 0;
    this.currentCart.discount = numVal;
    if (this._cartService.totalAmount > 0) {
      const pct = (numVal / this._cartService.totalAmount) * 100;
      this.discountPctInput = pct > 0 ? (Math.round(pct * 100) / 100).toString() : '';
    } else {
      this.discountPctInput = '';
    }
  }

  get getFormData(): any {
    const rawName = this.f['cPayname'].value;
    const username = typeof rawName === 'object' && rawName !== null ? rawName.username : (rawName || '');
    return {
      cPayname: username,
      cPayMobile: this.f['cPayMobile'].value,
      cPayEmail: 'pk@pk.pk',
      payment_method: this.f['payment_method'].value,
      cDiscount: this.f['cDiscount'].value,
      cDiscountVal: this.f['cDiscountVal'].value
    };
  }

  ngOnInit(): void {
    if (this.currentCart) {
      if (this.currentCart.username) {
        this.deliveryForm.get('cPayname')?.setValue(this.currentCart.username, { emitEvent: false });
      }
      if (this.currentCart.phonenumber) {
        this.deliveryForm.get('cPayMobile')?.setValue(this.currentCart.phonenumber, { emitEvent: false });
      }
      if (this._cartService.totalAmount > 0) {
        const discount = this.currentCart.discount || 0;
        this.discountValInput = discount > 0 ? (Math.round(discount * 100) / 100).toString() : '';
        const pct = (discount / this._cartService.totalAmount) * 100;
        this.discountPctInput = pct > 0 ? (Math.round(pct * 100) / 100).toString() : '';
      }
    }

    this.customerSuggestions$ = this.deliveryForm.get('cPayname')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(val => {
        const query = typeof val === 'object' && val !== null ? (val as CustomerSummary).username : (typeof val === 'string' ? val : '');
        if (query && query.trim().length >= 3) {
          return this.dataService.searchCustomers(query.trim());
        }
        return of([]);
      })
    );
  }

  displayCustomerFn(customer: CustomerSummary | string): string {
    if (customer && typeof customer === 'object') {
      return customer.username;
    }
    return customer || '';
  }

  onCustomerSelected(event: MatAutocompleteSelectedEvent): void {
    const selected: CustomerSummary = event.option.value;
    if (selected) {
      this.deliveryForm.patchValue({
        cPayname: selected.username,
        cPayMobile: selected.phonenumber
      });
      if (this.currentCart) {
        this.currentCart.username = selected.username;
        this.currentCart.phonenumber = selected.phonenumber;
      }
    }
  }

  onSubmit() {
    console.log("Submitting payment form in cart component");
    this.submitted = true;

    if (this.deliveryForm.invalid) {
      console.log("Payment form is invalid");
      return;
    }

    if (!this.currentCart || this._cartService.totalQuantity <= 0) {
      console.log('Checkout prevented: cart is empty');
      alert('Cart is empty. Please add items before printing.');
      return;
    }

    this.loading = true;
    var data = this.getFormData;

    this.currentCart!.username = data.cPayname ? data.cPayname : '';
    this.currentCart!.phonenumber = data.cPayMobile ? data.cPayMobile : '';
    this.currentCart!.emailid = 'pk@pk.pk';
    this.currentCart!.payment_method = data.payment_method ? data.payment_method : '';

    const val = data.cDiscountVal ? Number(data.cDiscountVal) : '';
    const pct = data.cDiscount ? Number(data.cDiscount) : '';
    if (val !== '') {
      this.currentCart!.discount = Number(val);
    } else if (pct !== '') {
      this.currentCart!.discount = (this._cartService.totalAmount * Number(pct)) / 100;
    } else {
      this.currentCart!.discount = 0;
    }

    console.log('coming before routing to receipt');
    this.router.navigate(['/receipt']);
  }

  get currentCart(): CartDetails | undefined | null {
    return this._cartService.currentCart;
  }

  get customerName(): String | null | undefined {
    return this._cartService.currentCart?.username;
  }

  get customerPh(): String | null | undefined {
    return this._cartService.currentCart?.phonenumber;
  }

  get payment_method(): String | null | undefined {
    return this._cartService.currentCart?.payment_method;
  }
}

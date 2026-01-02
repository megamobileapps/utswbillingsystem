import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UTSWCartItem } from 'src/app/models/cart-item';
import { InventoryItem } from 'src/app/models/inoffice';
import { CartDetails } from 'src/app/providers/cart.details';
import { CartService } from 'src/app/providers/cart.provider';
import { DataService } from 'src/app/services/data.service';
import { InventoryService } from 'src/app/services/inventory.service';
import { ScreenSizeService } from 'src/app/services/screen-size.service';
import { BehaviorSubject, Observable, startWith, debounceTime, distinctUntilChanged, switchMap, map, tap, Subscription } from 'rxjs';
import { environment } from "src/environments/environment";
import * as $ from "jquery";
import { InvoiceDataItem } from 'src/app/models/invoice-data-item';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import Fuse, { IFuseOptions } from 'fuse.js';
import { Store } from '@ngrx/store';
import * as InventoryActions from 'src/app/store/inventory/inventory.actions';
import { selectAllInventory, selectInventoryStatus } from 'src/app/store/inventory/inventory.selectors';


@Component({
  selector: 'app-directinvoice-form',
  templateUrl: './directinvoice-form.component.html',
  styleUrls: ['./directinvoice-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class DirectinvoiceFormComponent implements OnInit, OnDestroy {
  invoice: FormGroup;
  submitted:boolean=false;
  loading:boolean=false;
  isMobileScreen:boolean = false;
  todaydate:string='';
  currBasketAmt:number=0;
  @Input() oldinvoiceid!: string;

  allInventoryItems: InventoryItem[] = []; // Store all inventory items
  filteredOptions: Observable<InventoryItem[]>[] = []; // Observable for filtered suggestions per item
  private fuse: Fuse<InventoryItem>; // Declare fuse property
  private amountCalculationSubscription: Subscription;

  constructor(private formBuilder: FormBuilder,
    private _dataService:DataService, 
    private screenSizeService:ScreenSizeService,
    private _cartService:CartService,private router: Router, private route: ActivatedRoute,
    private datePipe: DatePipe,
    private store: Store
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
      
      this.invoice = this.formBuilder.group({
        items:this.formBuilder.array([
          this.createItemFormGroup()
        ])
      });
    }

    ngOnInit(): void {
      this.store.dispatch(InventoryActions.loadInventory());
      this.subscribeToInventory();

      if (this.oldinvoiceid != null && this.oldinvoiceid != "-1"){
        this.load_old_invoice_data(this.oldinvoiceid) // Then load old invoice data if applicable
      }

      this.amountCalculationSubscription = this.invoice.get('items')!.valueChanges.pipe(
        debounceTime(300)
      ).subscribe(() => {
        this.onCalculateBillAmount();
      });
    }

    ngOnDestroy(): void {
      if (this.amountCalculationSubscription) {
        this.amountCalculationSubscription.unsubscribe();
      }
    }

    clearInvoiceForm(): void {
      const items = this.invoice.get('items') as FormArray;
      items.clear();
      items.push(this.createItemFormGroup());
      this.setupFormArrayControls();
    }

    subscribeToInventory(): void {
      this.store.select(selectInventoryStatus).subscribe(status => {
        this.loading = status === 'loading';
      });

      this.store.select(selectAllInventory).subscribe(inventory => {
        if (inventory && inventory.length > 0) {
          this.allInventoryItems = inventory;
          // Initialize Fuse.js after inventory is loaded from the store
          const fuseOptions: IFuseOptions<InventoryItem> = {
            keys: ['productname', 'barcode', 'mrp'],
            threshold: 0.3,
            ignoreLocation: true,
            findAllMatches: true,
          };
          this.fuse = new Fuse(this.allInventoryItems, fuseOptions);
          this.setupFormArrayControls();
        }
      });
    }

    createItemFormGroup(): FormGroup {
      return this.formBuilder.group({
        productname:[null, Validators.required], // Initialize with null to hold InventoryItem object
        hsn: ['49011010'],
        quantity: ['1', Validators.required],
        unit: ['Nos'],
        cp: ['0'],
        percentgst: ['0'],
        netcp: ['0'],
        calculatedmrp: ['0'],
        mrp: ['0', Validators.required],
        discount:['0'],
        fixedprofit: ['0'],
        percentprofit: ['0'],
        labeleddate: [this.todaydate],
        vendor: ['utsw'],
        brand: ['utsw'],
        shippingcost: ['0'],
        barcode:['', Validators.required],
      });
    }

    setupFormArrayControls(): void {
      const items = this.invoice.get('items') as FormArray;
      this.filteredOptions = [];
      items.controls.forEach((control, index) => {
        const productNameControl = control.get('productname') as FormControl;
        
        this.filteredOptions[index] = productNameControl.valueChanges.pipe(
          startWith(''),
          debounceTime(300),
          distinctUntilChanged(),
          map(value => this._filter(value || ''))
        );
      });
    }

    private _filter(value: string | InventoryItem | null): InventoryItem[] {
      let filterValue: string;
      if (typeof value === 'string') {
        filterValue = value; 
      } else if (value && value.productname) {
        filterValue = value.productname;
      } else {
        filterValue = '';
      }

      if (!this.fuse || filterValue === '') {
        return this.allInventoryItems; // Return all items when search is empty or fuse is not initialized
      }
      
      const results = this.fuse.search(filterValue);
      return results.map(result => result.item);
    }

    displayFn(item: InventoryItem | string): string {
      if (typeof item === 'string') {
        return item;
      }
      return item && item.productname ? item.productname : '';
    }

    onProductSelected(event: MatAutocompleteSelectedEvent, itemIndex: number): void {
      const selectedItem: InventoryItem = event.option.value;
      this.patchItemForm(selectedItem, itemIndex);
      this.addItem(); // Automatically add a new row
    }
    
    // Helper to patch form group with selected item data
    patchItemForm(item: InventoryItem, itemIndex: number): void {
      const itemFormGroup = this.itemControls.at(itemIndex) as FormGroup;
      itemFormGroup.patchValue({
        productname: item, // Patch the whole object into the form control
        hsn: item.hsn,
        unit: item.unit,
        cp: item.cp,
        percentgst: item.percentgst,
        netcp: item.netcp,
        calculatedmrp: item.calculatedmrp,
        mrp: item.mrp,
        discount: item.discount || 0,
        fixedprofit: item.fixedprofit,
        percentprofit: item.percentprofit,
        labeleddate: item.labeleddate,
        vendor: item.vendor,
        brand: item.brand,
        shippingcost: item.shippingcost,
        barcode: item.barcode,
        // quantity: item.quantity, // Do not auto-fill quantity
      });
    }

    get itemControls(): FormArray {
      return this.invoice.get('items') as FormArray;
    }

    prepare_json_from_formgroup(fg:FormGroup):InventoryItem {
      let allControls = fg.controls;
      const productnameControlValue = allControls['productname'].value;
      
      // Helper to safely convert to number, defaulting to 0 if NaN
      const safeNumber = (value: any) => {
        const num = Number(value);
        return isNaN(num) ? 0 : num;
      };

      let item: InventoryItem;

      if (typeof productnameControlValue === 'object' && productnameControlValue !== null) {
        // If productname control holds the entire InventoryItem object
        // Use properties from the object as base, then override with form control values for editable fields
        const currentMrp = safeNumber(allControls['mrp'].value);
        const currentDiscount = safeNumber(allControls['discount'].value);
        const calculatedNetvalue = currentMrp * (100 - currentDiscount) / 100;

        item = {
          ...productnameControlValue, // Start with all properties from the selected InventoryItem
          productname: productnameControlValue.productname || '', // Ensure productname is string
          hsn: productnameControlValue.hsn || '',
          unit: productnameControlValue.unit || '',
          vendor: productnameControlValue.vendor || '',
          brand: productnameControlValue.brand || '',
          barcode: productnameControlValue.barcode || '',
          labeleddate: productnameControlValue.labeleddate || '',

          // Override numerical fields with values from form controls, ensuring they are numbers
          quantity: safeNumber(allControls['quantity'].value),
          cp: safeNumber(allControls['cp'].value),
          percentgst: safeNumber(allControls['percentgst'].value),
          netcp: safeNumber(allControls['netcp'].value),
          calculatedmrp: safeNumber(allControls['calculatedmrp'].value),
          mrp: currentMrp, // Use the potentially overridden MRP
          discount: currentDiscount, // Use the potentially overridden discount
          fixedprofit: safeNumber(allControls['fixedprofit'].value),
          percentprofit: safeNumber(allControls['percentprofit'].value),
          shippingcost: safeNumber(allControls['shippingcost'].value),
          netvalue: calculatedNetvalue, // Include netvalue directly in the object literal
        };
        
      } else {
        // If productname control holds a string (manual entry) or is null/undefined
        const currentMrp = safeNumber(allControls['mrp'].value);
        const currentDiscount = safeNumber(allControls['discount'].value);
        const calculatedNetvalue = currentMrp * (100 - currentDiscount) / 100;

        item = {
          productname: productnameControlValue || '',   
          hsn: allControls['hsn'].value || '',       
          quantity: safeNumber(allControls['quantity'].value),
          unit: allControls['unit'].value || '',
          cp: safeNumber(allControls['cp'].value),
          percentgst: safeNumber(allControls['percentgst'].value),
          netcp: safeNumber(allControls['netcp'].value),
          calculatedmrp: safeNumber(allControls['calculatedmrp'].value),
          mrp: currentMrp,
          discount: currentDiscount,
          fixedprofit: safeNumber(allControls['fixedprofit'].value),
          percentprofit: safeNumber(allControls['percentprofit'].value),
          labeleddate: allControls['labeleddate'].value || '',
          vendor: allControls['vendor'].value || '',
          brand: allControls['brand'].value || '',
          shippingcost: safeNumber(allControls['shippingcost'].value),
          barcode:allControls['barcode'].value || '',
          qtyavailable:0,
          sold:1,
          netvalue: calculatedNetvalue, // Include netvalue directly in the object literal
        };
      }
      return item;
    }

    allInvoiceItems():Array<any>{
      var itemValueArray:Array<any> = [];
      const items = this.invoice.get('items') as FormArray;
      if (!items.invalid) {
        for(let itemIndex=0;itemIndex<items.length;itemIndex++) {
          let allControls = (items.at(itemIndex) as FormGroup).controls;
          let itemValues = this.prepare_json_from_formgroup(items.at(itemIndex) as FormGroup);
          itemValueArray.push(itemValues);

        }
        
      }
      return itemValueArray;
    }

    addItem() {
      console.log('addItem() called')
      const items = this.invoice.get('items') as FormArray;
      const newItemFormGroup = this.createItemFormGroup();
      items.push(newItemFormGroup);
      // Setup filtering for the new item's productname control
      const newIndex = items.length - 1;
      const productNameControl = newItemFormGroup.get('productname') as FormControl;
      this.filteredOptions[newIndex] = productNameControl.valueChanges.pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        map(value => this._filter(value || ''))
      );
    }

  load_old_invoice_data(invoiceid:any){
    
    console.log(`load_old_invoice_data() entered with invoiceid=${invoiceid}`)
    var jsondata:InvoiceDataItem|null = null
  
    if (invoiceid != null && invoiceid != "-1") {
      this._dataService.getInvoiceDataFromServer_with_invoiceid(invoiceid).subscribe((d) => {       
        console.log('load_old_invoice_data(): '+JSON.stringify(d));      
        if( d.length > 0)  {
          jsondata = d[0]
          console.log('load_old_invoice_data() called')
          this._cartService.initialize_from_existing_cartdata(jsondata)
          const items = this.invoice.get('items') as FormArray;
          items.clear();
          // const data_to_load:Array<UTSWCartItem> = JSON.parse(jsondata!["invoicedata"]);
          let data_to_load: UTSWCartItem[] = []
          if (typeof jsondata!["invoicedata"] === 'string') {
            data_to_load = JSON.parse(jsondata!["invoicedata"]);
          }else if (typeof jsondata!["invoicedata"] === 'object') {
            data_to_load = jsondata!["invoicedata"] as UTSWCartItem[];
          }
          if (typeof data_to_load === 'string') {
            data_to_load = JSON.parse(data_to_load);
          }
          
          data_to_load.forEach(element => {
            items.push(
              this.formBuilder.group({
                productname:[element["productName"]],
                hsn: [element["hsn"]],
                quantity: [element["quantity"]],
                unit: [element["unitTag"]],
                cp: [element["initialPrice"]],
                percentgst: ['0'],
                netcp: [element["initialPrice"]],
                calculatedmrp: [element["productPrice"]],
                mrp: [element["productPrice"]],
                discount:['0'],
                fixedprofit: ['0'],
                percentprofit: ['0'],
                labeleddate: [this.todaydate],
                vendor: ['utsw'],
                brand: ['utsw'],
                shippingcost: ['0'],
                barcode:[element["id"]],
              })
            );
          });
        }
      });
    }
  
  }

  removeItem(index: any) {
    const items = this.invoice.get('items') as FormArray;
    this._cartService.removeFromCart(this.prepare_json_from_formgroup(items.at(index) as FormGroup));
    items.removeAt(index);
  }

  calculateCPMRPProfit(){
    let fd = this.allInvoiceItems();
    // This method is commented out in HTML
  }

  clearCart():void{
    this._cartService.currentCart!.invoicedatalist=[];
  }

  onPushToCart(){
    console.log('onPushToCart called');
    console.log("onPushToCart component");
    this.submitted = true;
    this.loading = true;
  
    const items = this.invoice.get('items') as FormArray;
    
    for (let i = 0; i < items.length; i++) {
        const itemGroup = items.at(i) as FormGroup;
        const productnameValue = itemGroup.get('productname')?.value;
  
        if (!productnameValue) {
            continue; 
        }
  
        if (typeof productnameValue === 'string' && !itemGroup.get('barcode')?.value) {
            const newBarcode = `manual-${Date.now()}-${i}`;
            itemGroup.get('barcode')?.setValue(newBarcode, { emitEvent: false });
        }
  
        if (itemGroup.valid) {
            const itemValues = this.prepare_json_from_formgroup(itemGroup);
            console.log(`onPushToCart(): adding item number ${i} ${JSON.stringify(itemValues)}`);
            this._cartService.addToCart(itemValues);
        } else {
            const productNameDisplay = (typeof productnameValue === 'object' && productnameValue?.productname) 
                                       ? productnameValue.productname 
                                       : productnameValue;
            console.log(`onPushToCart(): Row for product "${productNameDisplay}" has invalid values.`);
            alert(`Item "${productNameDisplay}" has invalid values and will not be added to the cart.`);
            itemGroup.markAllAsTouched();
        }
    }
  
    this.loading = false;
    console.log('Finished processing all items.');
  }

  onPushSingleItemToCart(itemIndex=0){
    const items = this.invoice.get('items') as FormArray;
    const itemGroup = items.at(itemIndex) as FormGroup;
  
    if (itemGroup) {
        const productnameControlValue = itemGroup.get('productname')?.value;
        const barcodeControl = itemGroup.get('barcode');
  
        if (typeof productnameControlValue === 'string' && !barcodeControl?.value) {
            const newBarcode = 'manual-' + Date.now();
            barcodeControl?.setValue(newBarcode, { emitEvent: false });
        }
  
        if (itemGroup.valid) {
            const itemValues = this.prepare_json_from_formgroup(itemGroup);
            console.log('onPushSingleItemToCart(): item = ' + JSON.stringify(itemValues));
            this._cartService.addToCart(itemValues);
        } else {
            console.log('onPushSingleItemToCart() Item form has invalid values. Please check.');
            alert('Item form has invalid values. Please check.');
        }
    }
  }

    onCalculateBillAmount(){
      console.log('onCalculateBillAmount called');
      console.log("onCalculateBillAmount component");
      this.submitted = true;
      this.currBasketAmt = 0.0;
      
      const items = this.invoice.get('items') as FormArray;
  
      this.loading = true;
      var amount = 0;
  
      for (const control of items.controls) {
        if (control.valid) {
          const itemValues = this.prepare_json_from_formgroup(control as FormGroup);
          console.log("onCalculateBillAmount(): adding item " + JSON.stringify(itemValues));
          amount += (itemValues.mrp * (100 - itemValues.discount) / 100) * itemValues.quantity;
        }
      }
      
      console.log('total Amount = '+amount);
      this.currBasketAmt = amount;
      this.loading = false;
    }
  get currentCart():CartDetails|undefined|null{
    return this._cartService.currentCart;
  }

    checkoutpayu(custinfo:any) {
      
      // global data
      var ran1 = Math.floor((Math.random() * 999999) + 1);
      var d = new Date();
      var n = d.getTime();
      var userId ='pkk';
      var data = {
        key: 'fop2UnJB',        
        txnid:userId+'-'+ran1,
        amount:100.1  
      };
      var form = $('<form></form>');
      // form.attr("action", environment.apiUrl+"/enrol/payu/submit.php");
      form.attr("action", environment.apiBackend+"/in/ci/Payusubmit/qr");
      // form.attr("action", 'https://www.uptoschoolworksheets.com/in'+"/enrol/payu/submit.php");
      form.attr("method", "POST");
      form.attr("style", "display:none;");
      this.addFormFields(form, data);
      
      $("body").append(form);
  
      // submit form
  
      form.submit();
      form.remove();
          
        
      }
  
      // Add form data
      //
      addFormFields(form:JQuery<HTMLElement>, data:any){
        //alert(typeof data);
        var keys = Object.keys(data);
        for(var i=0;i<keys.length;i++) {
            var paramName = keys[i];
            var paramValue = data[paramName];
            
            var field1 = $("<input></input>");
            $(field1).attr("type","hidden"); 
            $(field1).attr("name", paramName );
            $(field1).attr("id", paramName );
            $(field1).val(paramValue);
            
            $(form).append(field1);
        }
    };
}
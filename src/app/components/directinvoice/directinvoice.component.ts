import { isNgTemplate } from '@angular/compiler';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UTSWCartItem } from 'src/app/models/cart-item';
import { InventoryItem } from 'src/app/models/inoffice';
import { CartDetails } from 'src/app/providers/cart.details';
import { CartService } from 'src/app/providers/cart.provider';
import { DataService } from 'src/app/services/data.service';
import { InventoryService } from 'src/app/services/inventory.service';
import { ScreenSizeService } from 'src/app/services/screen-size.service';
import { BehaviorSubject } from 'rxjs';
import { environment } from "src/environments/environment";
import * as $ from "jquery";

@Component({
  selector: 'app-directinvoice',
  templateUrl: './directinvoice.component.html',
  styleUrls: ['./directinvoice.component.css']
})
export class DirectinvoiceComponent {
  invoice: FormGroup;
  submitted:boolean=false;
  loading:boolean=false;
  isMobileScreen:boolean = false;
  todaydate:string='';
  currBasketAmt:number=0;

  constructor(private formBuilder: FormBuilder,
    private _dataService:DataService, 
    private    _inventoryService : InventoryService,
    private screenSizeService:ScreenSizeService,
    private _cartService:CartService,private router: Router, private route: ActivatedRoute) {
      let date1 = new Date();
      const year = date1.getFullYear(); // e.g., 2023
      let month = date1.getMonth()+1; // e.g., 7 (for July)
      const day = date1.getDate(); // e.g., 7 (for July)
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
      // console.log('today = '+this.todaydate);
      
      this.invoice = this.formBuilder.group({
        items:this.formBuilder.array([
        this.formBuilder.group({
        productname:[''],
        hsn: ['49011010'],
        quantity: ['1'],
        unit: ['Nos'],
        cp: ['0'],
        percentgst: ['0'],
        netcp: ['0'],
        calculatedmrp: ['0'],
        mrp: ['0'],
        discount:['0'],
        fixedprofit: ['0'],
        percentprofit: ['0'],
        labeleddate: [this.todaydate],
        vendor: ['utsw'],
        brand: ['utsw'],
        shippingcost: ['0'],
        barcode:['Barcode1'],
      })]
      )});
    }
    get f2() { 
     
        return this.invoice.controls;
     
     }

    get itemControls(): any {
      return this.invoice.get('items') as FormArray;
    }

    prepare_json_from_formgroup(fg:FormGroup):InventoryItem {
      let allControls = fg.controls;
      return {
        productname: allControls['productname'].value,   
        hsn: allControls['hsn'].value,       
        quantity: Number(allControls['quantity'].value),
        unit: allControls['unit'].value,
        cp: allControls['cp'].value,
        percentgst: allControls['percentgst'].value,
        netcp: allControls['netcp'].value,
        calculatedmrp: allControls['calculatedmrp'].value,
        mrp: allControls['mrp'].value,
        discount: Number(allControls['discount'].value),
        netvalue:Number(allControls['mrp'].value)*(100-Number(allControls['discount'].value))/100,
        fixedprofit: allControls['fixedprofit'].value,
        percentprofit: allControls['percentprofit'].value,
        labeleddate: allControls['labeleddate'].value,
        vendor: allControls['vendor'].value,
        brand: allControls['brand'].value,
        shippingcost: allControls['shippingcost'].value,
        barcode:allControls['barcode'].value,
      };
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

    // get getInventoryFormData():any{
    //   return {
    //       productname: this.f2['productname'].value,   
    //       hsn: this.f2['hsn'].value,       
    //       quantity: this.f2['quantity'].value,
    //       unit: this.f2['unit'].value,
    //       cp: this.f2['cp'].value,
    //       percentgst: this.f2['percentgst'].value,
    //       netcp: this.f2['netcp'].value,
    //       calculatedmrp: this.f2['calculatedmrp'].value,
    //       mrp: this.f2['mrp'].value,
    //       fixedprofit: this.f2['fixedprofit'].value,
    //       percentprofit: this.f2['percentprofit'].value,
    //       labeleddate: this.f2['labeleddate'].value,
    //       vendor: this.f2['vendor'].value,
    //       brand: this.f2['brand'].value,
    //       shippingcost: this.f2['shippingcost'].value,
    //       barcode:this.f2['barcode'].value,
    //   };
    // }

    addItem() {
      console.log('addItem() called')
      const items = this.invoice.get('items') as FormArray;
      if (!items.invalid) {
        items.push(
          this.formBuilder.group({
            productname:[''],
            hsn: ['49011010'],
            quantity: ['1'],
            unit: ['Nos'],
            cp: ['0'],
            percentgst: ['0'],
            netcp: ['0'],
            calculatedmrp: ['0'],
            mrp: ['0'],
            discount:['0'],
            fixedprofit: ['0'],
            percentprofit: ['0'],
            labeleddate: [this.todaydate],
            vendor: ['utsw'],
            brand: ['utsw'],
            shippingcost: ['0'],
            barcode:['Barcode'+(items.length+1)],
          })
        );
      }else {
        console.log('additem(): items is Invalid');
        alert('onPushSingleItemToCart() List of items have invalid values.. pls check')
      }
    }

    load_old_invoice_data(jsondata_in:any){
      
      var jsondata = {
        "id": 6958,
        "username": "Shiffauli Garg",
        "amount": 289.0,
        "phonenumber": "9611146074",
        "emailid": "shiffauli74@yahoo.com",
        "invoicenumber": "655705",
        "invoicedate": "2024-12-11",
        "discount": "0",
        "payment_method": "SBIQR",
        "invoicedata": "[{\"txId\":655705,\"id\":\"Barcode1\",\"quantityProvider\":{\"closed\":false,\"currentObservers\":null,\"observers\":[],\"isStopped\":false,\"hasError\":false,\"thrownError\":null,\"_value\":1},\"quantity\":1,\"productCategory\":\"utsw\",\"productId\":\"Barcode1\",\"productName\":\"dairy\",\"initialPrice\":\"249\",\"productPrice\":249,\"discount\":0,\"gst\":\"0\",\"hsn\":\"49011010\",\"unitTag\":\"Nos\",\"image\":\"\",\"labeldate\":\"2024-12-11\"},{\"txId\":655705,\"id\":\"Barcode2\",\"quantityProvider\":{\"closed\":false,\"currentObservers\":null,\"observers\":[],\"isStopped\":false,\"hasError\":false,\"thrownError\":null,\"_value\":4},\"quantity\":4,\"productCategory\":\"utsw\",\"productId\":\"Barcode2\",\"productName\":\"hauser\",\"initialPrice\":\"10\",\"productPrice\":10,\"discount\":0,\"gst\":\"0\",\"hsn\":\"49011010\",\"unitTag\":\"Nos\",\"image\":\"\",\"labeldate\":\"2024-12-11\"}]"
    }
      
      console.log('load_old_invoice_data() called')
      this._cartService.initialize_from_existing_cartdata(jsondata)
      const items = this.invoice.get('items') as FormArray;
      items.clear();
      const data_to_load:Array<UTSWCartItem> = JSON.parse(jsondata["invoicedata"]);
      data_to_load.forEach(element => {
        if (true) {
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
        }else {
          console.log('load_old_invoice_data(): items is Invalid');
          alert('onPushSingleItemToCart() List of items have invalid values.. pls check')
        }
      });
    
    }

    removeItem(index: any) {
      const items = this.invoice.get('items') as FormArray;
      //first remove this item from cart and then from this list
      this.removeFromCart(this.prepare_json_from_formgroup(items.at(index) as FormGroup));

      //remove from FormArray after it is removed from cart
      items.removeAt(index);
    }

    calculateCPMRPProfit(){
      let fd = this.allInvoiceItems();
      
    }
    ngOnInit(): void {
    }

    get cart():CartDetails|null|undefined{
      return this._cartService.currentCart;
    }
  
 
    checkIfCartItemExistInCart(ofItem:UTSWCartItem|null):Array<UTSWCartItem>|undefined{
      if(null == ofItem) return [];
      return this.cart?.invoicedatalist.filter((value, index)=> 
      value.productCategory == ofItem.productCategory &&
      value.productId == ofItem.productId &&
      value.id == ofItem.id &&
      value.productName == ofItem.productName
      );
      
    }
    
    
  
    // return -1 if it does not exist
    checkIfExistInCart(ofItem:InventoryItem|null):Array<UTSWCartItem>|undefined{
      if(null == ofItem) 
        return [];
                 
        return this.cart?.invoicedatalist.filter((value, index)=> 
          value.productCategory == ofItem.brand &&
          value.productId == ofItem.barcode &&
          value.id == ofItem.barcode.toString() &&
          value.productName == ofItem.productname
        );
      
      
    }
  
    prepareCartItem(txId:number, ofItem:InventoryItem):UTSWCartItem{
      var retVal:UTSWCartItem  = {
        txId:txId,
        id:ofItem.barcode.toString(),    
        quantityProvider:new BehaviorSubject<number>(ofItem.quantity),
        quantity:ofItem.quantity,
        productCategory:ofItem.brand,    
        productId:ofItem.barcode,
        productName:ofItem.productname,
        initialPrice:ofItem.mrp,
        productPrice:(ofItem.mrp)*((100-ofItem.discount)/100), // initialprice - discount
        discount:ofItem.discount,        
        gst:ofItem.percentgst,      
        hsn:ofItem.hsn,
        unitTag:'Nos',
        image:'',
        labeldate:ofItem.labeleddate
      };
      return retVal;
    }
    addToCart(ofItem:InventoryItem|null){
      var existingItem = this.checkIfExistInCart(ofItem!);
      var txId = this.cart!.invoicedatalist.length == 0?
                Math.floor(Math.random() * 1000000)
                :this.cart!.invoicedatalist[0].txId;
      this._cartService.currentCart!.invoicenumber = txId;
      if(existingItem!.length == 0) {
        // txId = Math.floor(Math.random() * 1000000);
        this.cart!.invoicedatalist.push(this.prepareCartItem(txId, ofItem!))
      }else{
        //item.quantity.next(item.quantity.getValue()+1);
        existingItem![0].quantityProvider .next(existingItem![0].quantityProvider.getValue()+1);
        existingItem![0].quantity +=1;
      }
  
      // this.cart.push(ofItem!);
    }

    getItemAmount(ofItem:InventoryItem|null){
      let l = this.prepareCartItem(1, ofItem!);
      return l.productPrice * l.quantity;
    }

    removeFromCart(ofItem:InventoryItem|null){
      var existingItem = this.checkIfExistInCart(ofItem!);
      var txId = this.cart!.invoicedatalist.length == 0?
                Math.floor(Math.random() * 1000000)
                :this.cart!.invoicedatalist[0].txId;
      this._cartService.currentCart!.invoicenumber = txId;
      if(existingItem!.length == 0) {
        // txId = Math.floor(Math.random() * 1000000);
        // this.cart!.invoicedatalist.push(this.prepareCartItem(txId, ofItem!))
      }else{
        //item.quantity.next(item.quantity.getValue()+1);
        existingItem![0].quantityProvider .next(0);
        existingItem![0].quantity =0;
      }
  
      // this.cart.push(ofItem!);
    }
    clearCart():void{
      this._cartService.currentCart!.invoicedatalist=[];
    }

    // Push single item to cart
    onPushSingleItemToCart(itemIndex=0){
      
      const items = this.invoice.get('items') as FormArray;
      if (!items.invalid) {        
          let allControls = (items.at(itemIndex) as FormGroup).controls;
          let itemValues = this.prepare_json_from_formgroup(items.at(itemIndex) as FormGroup);
          console.log('onPushSingleItemToCart(): item = '+JSON.stringify(itemValues));
          this.addToCart(itemValues);
      }else {
        console.log('onPushSingleItemToCart() List of items have invalid values.. pls check');
        alert('onPushSingleItemToCart() List of items have invalid values.. pls check');
      }
     
    }
    //
    // push all items to cart
    //
    onPushToCart(){
      console.log('onPushToCart called');
      console.log("onPushToCart component");
      this.submitted = true;
      // stop here if form is invalid
      if (this.invoice.invalid) {
        console.log("inventory options form is invalid");
          return;
      }
  
      this.loading = true;
      var formData:Array<any> = this.allInvoiceItems();
      // this.clearCart();
      for(let indexItem = 0;indexItem<formData.length;indexItem++){
        console.log("onPushToCart(): adding item number "+indexItem+" "+JSON.stringify(formData[indexItem]));
        this.addToCart(formData[indexItem]);
      }
      //
      // key will be barcode/labeleddate to have multiple entries under same barcode
      //
      var data = {"itemdetails":formData};
                  //_inventoryService
      // this._inventoryService.addInventory(data).then((res) => {
      //   console.log('Inventory onSubmitFire(): ',res);   
      //   alert('inventory is added successfully')     
      // })
      // .catch((err) => {
      //   console.log('Inventory onSubmitFire() error: ' + err);
      //   alert('Error while Inventory onSubmitFire()');        
      // });    
      console.log('coming before routing to Home'+JSON.stringify(data));
      // this.router.navigate(['/']);
    }
  
    onCalculateBillAmount(){
      console.log('onCalculateBillAmount called');
      console.log("onCalculateBillAmount component");
      this.submitted = true;
      this.currBasketAmt = 0.0;
      
      if (this.invoice.invalid) {
        console.log("inventory options form is invalid");
          return;
      }
  
      this.loading = true;
      var formData:Array<any> = this.allInvoiceItems();
      
      var amount = 0;
      for(let indexItem = 0;indexItem<formData.length;indexItem++){
        console.log("onCalculateBillAmount(): adding item number "+indexItem+" "+JSON.stringify(formData[indexItem]));
        amount += this.getItemAmount(formData[indexItem]);
      }
      console.log('total Amount = '+amount);
      this.currBasketAmt = amount;
      
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

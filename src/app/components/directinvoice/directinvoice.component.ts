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

  constructor(private formBuilder: FormBuilder,
    private _dataService:DataService, 
    private    _inventoryService : InventoryService,
    private screenSizeService:ScreenSizeService,
    private _cartService:CartService,private router: Router, private route: ActivatedRoute) {
      
      this.invoice = this.formBuilder.group({
        items:this.formBuilder.array([
        this.formBuilder.group({
        productname:['utsw'],
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
        labeleddate: ['2023-01-29'],
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

    allInvoiceItems():Array<any>{
      var itemValueArray:Array<any> = [];
      const items = this.invoice.get('items') as FormArray;
      if (!items.invalid) {
        for(let itemIndex=0;itemIndex<items.length;itemIndex++) {
          let allControls = (items.at(itemIndex) as FormGroup).controls;
          let itemValues = {
            productname: allControls['productname'].value,   
            hsn: allControls['hsn'].value,       
            quantity: allControls['quantity'].value,
            unit: allControls['unit'].value,
            cp: allControls['cp'].value,
            percentgst: allControls['percentgst'].value,
            netcp: allControls['netcp'].value,
            calculatedmrp: allControls['calculatedmrp'].value,
            mrp: allControls['mrp'].value,
            discount: allControls['discount'].value,
            fixedprofit: allControls['fixedprofit'].value,
            percentprofit: allControls['percentprofit'].value,
            labeleddate: allControls['labeleddate'].value,
            vendor: allControls['vendor'].value,
            brand: allControls['brand'].value,
            shippingcost: allControls['shippingcost'].value,
            barcode:allControls['barcode'].value,
          };
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
      const items = this.invoice.get('items') as FormArray;
      if (!items.invalid) {
        items.push(
          this.formBuilder.group({
            productname:['utsw'],
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
            labeleddate: ['2023-01-29'],
            vendor: ['utsw'],
            brand: ['utsw'],
            shippingcost: ['0'],
            barcode:['Barcode'+(items.length+1)],
          })
        );
      }
    }

    removeItem(index: any) {
      const items = this.invoice.get('items') as FormArray;
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
    clearCart():void{
      this._cartService.currentCart!.invoicedatalist=[];
    }

    onAddToCart(){
      console.log('onSubmitFire called');
      console.log("Submitting payment form in cart component");
      this.submitted = true;
      // stop here if form is invalid
      if (this.invoice.invalid) {
        console.log("inventory options form is invalid");
          return;
      }
  
      this.loading = true;
      var formData:Array<any> = this.allInvoiceItems();
      this.clearCart();
      for(let indexItem = 0;indexItem<formData.length;indexItem++){
        console.log("onAddToCart(): adding item number "+indexItem+" "+JSON.stringify(formData[indexItem]));
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
  
    get currentCart():CartDetails|undefined|null{
      return this._cartService.currentCart;
    }

}

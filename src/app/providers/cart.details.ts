import { BehaviorSubject } from "rxjs";
import { UTSWCartItem } from "../models/cart-item";
import { InventoryItem } from "../models/inoffice";

export class CartDetails{
    // txId:number=0;
    invoicenumber: number=0;
    // cart : Array<UTSWCartItem>=[];
    invoicedatalist: Array<UTSWCartItem>=[];//this will be stringified and assigned to invoicedata before sending to server to savve
    id: number=0;
    username: String='';
    amount: number=0;
    phonenumber: String='';
    emailid: String='';
    
    invoicedateNum: number=Date.now();
    invoicedate: String|null=Date.now().toString();
    discount: number=0;
    payment_method: String='GPay';
    isEditing:boolean=false;
    
    prepareCartItem(txId:number, ofItem:any):UTSWCartItem{
        var retVal:UTSWCartItem  = {
          txId:txId,
          id:ofItem.productId.toString(),    
          quantityProvider:new BehaviorSubject<number>(ofItem.quantity),
          quantity:ofItem.quantity,
          productCategory:ofItem.productCategory,    
          productId:ofItem.productId,
          productName:ofItem.productName,
          initialPrice:ofItem.initialPrice,
          productPrice:(ofItem.initialPrice)*((100-ofItem.discount)/100), // initialprice - discount
          discount:ofItem.discount,        
          gst:ofItem.gst,      
          hsn:ofItem.hsn,
          unitTag:ofItem.unitTag,
          image:ofItem.image,
          labeldate:ofItem.labeldate,
          
        };
        return retVal;
      }
    initialize_meta_data(json_data:any){
        let parent = this;
        this.username = json_data["username"];
        this.id = json_data["id"]
        this.invoicenumber = json_data["invoicenumber"]
        this.amount = json_data["amount"]
        this.phonenumber = json_data["phonenumber"]
        this.emailid = json_data["emailid"]
        this.discount = json_data["discount"]
        this.payment_method = json_data["payment_method"]
        this.invoicedate = json_data["invoicedate"]

        let invoice_data:Array<InventoryItem> = JSON.parse(json_data["invoicedata"])
        parent.invoicedatalist=[]
        invoice_data.forEach(element=>{
            parent.invoicedatalist.push(parent.prepareCartItem(json_data["invoicenumber"], element));
        })
        this.isEditing = true;
    }
}
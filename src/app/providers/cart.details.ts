import { UTSWCartItem } from "../models/cart-item";

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
    

}
export interface InvoiceDataItem {
    id:string;
    username:string;
    amount:string;
    phonenumber:string;
    emailid:string;
    invoicenumber:string;
    invoicedate:string;
    discount:string;
    payment_method:string;
    invoicedata:string;
};

export interface InvoiceSoldItems {
    barcode:string;
    quantity:number;
    labeldate:string;
    brand:string;
}
export interface InOfficePrice{   
    id:number;
    grade:String;
    gradelevel2:String;
    subId:String;
    barcode:String;
    subject:String;
    pcost:number;
    discount:number;
    inventory:number;
    subposition:number;
    gst:number;      
    hsn:number;
    netvalue:number;
    quantity:number;
    total:number;
};

export interface InOfficeCat{
    id:number;
    grade:String;
};

export interface InventoryItem {
    barcode:String;
    brand:String;
    calculatedmrp:number;
    cp:number;
    fixedprofit:number;
    hsn:number;
    labeleddate:String;
    mrp:number;
    netcp:number;
    percentgst:number;
    percentprofit:number;
    productname:String;
    quantity:number;
    shippingcost:number;
    unit:String;
    vendor:String;
    discount:number;
    netvalue:number;
};

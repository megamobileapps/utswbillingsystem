export interface InOfficePrice{   
    id:number;
    grade:string;
    gradelevel2:string;
    subId:string;
    barcode:string;
    subject:string;
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
    grade:string;
};

export interface InventoryItem {
    barcode:string;
    brand:string;
    calculatedmrp:number;
    cp:number;
    fixedprofit:number;
    hsn:number;
    labeleddate:string;
    mrp:number;
    netcp:number;
    percentgst:number;
    percentprofit:number;
    productname:string;
    quantity:number;
    shippingcost:number;
    unit:string;
    vendor:string;
    discount:number;
    netvalue:number;
    qtyavailable:number;
    sold:number;
};

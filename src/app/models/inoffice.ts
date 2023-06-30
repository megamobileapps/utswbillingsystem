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
}
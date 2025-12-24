import { BehaviorSubject, Observable } from "rxjs";

export interface UTSWCartItem {
    txId:number;
    id:string;    
    quantityProvider:BehaviorSubject<number>;
    quantity:number;
    productCategory:String;    
    productId:String;
    productName:String;
    initialPrice:number;
    productPrice:number;
    discount:number;        
    gst:number;      
    hsn:number;
    unitTag:String;
    labeldate:String;
    image:String;
    matchType?: 'exact' | 'approximate' | 'none';

}

/*
late final String? txId;
  late final String? id;
  final String? productId;
  final String? productName;
  final String? productCategory;
  final int? initialPrice;
  final int? productPrice;
  final ValueNotifier<int>? quantity;
  final String? unitTag;
  final String? image;
  final int? discount;
*/
import { Injectable } from '@angular/core';
import { ALL_GST, ALL_BUYERS, ALL_HSNS, ALL_GST_TYPES, ALL_VENDORS, EXPENSE_HEAD, EXPENSE_CAT } from '../data/data';
import { Observable, from, of } from 'rxjs';
import { CommonService } from './common.service';
import { OutwardsaletypeJson } from '../models/outwardsaletype';
// import { InwardpurchasetypeJson } from '../types/inwardpurchasetype';
// import { ExpenseTypeJson } from '../types/expesnetype';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BarcodeService {
  outwardSales: Array<any> = [];
  inwardpurchases: Array<any> = [];
  expenses: Array<any> = [];

  // Specific base paths for each entity type
  barcodeComponentsBasePath = '/in/ci/barcode-components';
  barcodesBasePath = '/in/ci/barcodes';
  barcodeRelationshipBasePath = '/in/ci/barcode-relationship'; // Assuming a new endpoint for relationships

  constructor(public commonService: CommonService,
              private http: HttpClient) {
  }

  // setbasefolder(in_basefolder:any) { // No longer needed
  //   this.basefolder =  in_basefolder;
  // }

  // getbasefolder() { // No longer needed
  //   return this.basefolder;
  // }
  
  addBarcodeRelationship(data: any) {
    if((typeof data.level === 'undefined'  || data.level === '' || data.level == null ) ||
    (typeof data.children_value === 'undefined'  || data.children_value === '' || data.children_value == null ) ||
    (typeof data.parent_value === 'undefined'  || data.parent_value === '' || data.parent_value == null )
    ){
      return Promise.reject('Undefined values for mandatory fields');
    }
    

    if(typeof data.id === 'undefined'  || data.id === '' || data.id == null )
      data.id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 12);
    //this.outwardSales.push(data);
    console.log("addBarcodeRelationship():",JSON.stringify(data));
    data.key = data.id;
    
    return this.commonService.add(this.barcodeRelationshipBasePath+"/", data);
  }

  
  deleteBarcodeRelationship(obj: any) {
    //this.outwardSales.splice(idx, 1);
    return this.commonService.delete(this.barcodeRelationshipBasePath+"/", obj);
  }

  
  getAllBarcodeRelationship() {
    //console.log("getAllOutwardSales called", JSON.stringify(this.outwardSales));
    return this.commonService.getList(this.barcodeRelationshipBasePath+'/');
  }

  addBarcode(data: any) {
    
    if(typeof data.id === 'undefined'  || data.id === '' || data.id == null )
      data.id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 12);
    //this.outwardSales.push(data);
    console.log("addBarcode():",JSON.stringify(data));
    data.key = data.id;
    
    return this.commonService.add(this.barcodesBasePath+"/", data);
  }

  
  deleteBarcode(obj: any) {
    //this.outwardSales.splice(idx, 1);
    return this.commonService.delete(this.barcodesBasePath+"/", obj);
  }

  
  getAllBarcode() {
    //console.log("getAllOutwardSales called", JSON.stringify(this.outwardSales));
    return this.commonService.getList(this.barcodesBasePath+'/');
  }

  addBarcodecomponentAtLevel(data: any) {
    
    if(typeof data.id === 'undefined'  || data.id === '' || data.id == null )
      data.id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 12);
    //this.outwardSales.push(data);
    console.log("addBarcodecomponentAtLevel():",JSON.stringify(data));
    data.key = data.id;
    
    return this.commonService.add(this.barcodeComponentsBasePath+"/", data);
  }

  
  deleteBarcodecomponentAtLevel(obj: any) {
    //this.outwardSales.splice(idx, 1);
    return this.commonService.delete(this.barcodeComponentsBasePath+"/", obj);
  }

  
  getAllBarcodecomponentAtLevel() {
    //console.log("getAllOutwardSales called", JSON.stringify(this.outwardSales));
    return this.commonService.getList(this.barcodeComponentsBasePath+'/');
  }

}

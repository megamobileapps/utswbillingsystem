import { Injectable } from '@angular/core';
import { ALL_GST, ALL_BUYERS, ALL_HSNS, ALL_GST_TYPES, ALL_VENDORS, EXPENSE_HEAD, EXPENSE_CAT } from '../data/data';
import { Observable, from, of } from 'rxjs';
// import 'rxjs/add/observable/of';
// import 'rxjs/add/operator/map';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import * as firebase from 'firebase/app';
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
  basefolder : any = '/barcode';
  constructor(public commonService: CommonService,
              public afDb: AngularFireDatabase,
              public afAuth: AngularFireAuth,
              private http: HttpClient) {
  }

  setbasefolder(in_basefolder:any) {
    this.basefolder =  in_basefolder;
  }

  getbasefolder() {
    return this.basefolder;
  }
  
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
    
    return this.commonService.add(this.basefolder+"/relationship/"+data.level+"/", data);
  }

  
  deleteBarcodeRelationship(obj: OutwardsaletypeJson) {
    //this.outwardSales.splice(idx, 1);
    return this.commonService.delete(this.basefolder+"/relationship/", obj);
  }

  
  getAllBarcodeRelationship() {
    //console.log("getAllOutwardSales called", JSON.stringify(this.outwardSales));
    return this.commonService.getList(this.basefolder+'/relationship/');
  }

  addBarcode(data: any) {
    
    if(typeof data.id === 'undefined'  || data.id === '' || data.id == null )
      data.id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 12);
    //this.outwardSales.push(data);
    console.log("addBarcode():",JSON.stringify(data));
    data.key = data.id;
    
    return this.commonService.add(this.basefolder+"/barcodelist/", data);
  }

  
  deleteBarcode(obj: OutwardsaletypeJson) {
    //this.outwardSales.splice(idx, 1);
    return this.commonService.delete(this.basefolder+"/barcodelist/", obj);
  }

  
  getAllBarcode() {
    //console.log("getAllOutwardSales called", JSON.stringify(this.outwardSales));
    return this.commonService.getList(this.basefolder+'/barcodelist/');
  }

  addBarcodecomponentAtLevel(data: any) {
    
    if(typeof data.id === 'undefined'  || data.id === '' || data.id == null )
      data.id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 12);
    //this.outwardSales.push(data);
    console.log("addBarcodecomponentAtLevel():",JSON.stringify(data));
    data.key = data.id;
    
    return this.commonService.add(this.basefolder+"/barcodecomponents/", data);
  }

  
  deleteBarcodecomponentAtLevel(obj: OutwardsaletypeJson) {
    //this.outwardSales.splice(idx, 1);
    return this.commonService.delete(this.basefolder+"/barcodecomponents/", obj);
  }

  
  getAllBarcodecomponentAtLevel() {
    //console.log("getAllOutwardSales called", JSON.stringify(this.outwardSales));
    return this.commonService.getList(this.basefolder+'/barcodecomponents/');
  }

}

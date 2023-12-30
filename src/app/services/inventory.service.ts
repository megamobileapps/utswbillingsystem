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
export class InventoryService {
  outwardSales: Array<any> = [];
  inwardpurchases: Array<any> = [];
  expenses: Array<any> = [];
  basefolder : any = '/inventory';
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
  
  

  addInventory(data: any) {
    
    if(typeof data.id === 'undefined'  || data.id === '' || data.id == null )
      data.id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 12);
    //this.outwardSales.push(data);
    console.log("addInventory():",JSON.stringify(data));
    data.key = data.id;
    
    return this.commonService.add(this.basefolder+"/", data);
  }

  
  deleteInventory(obj: any) {
    //this.outwardSales.splice(idx, 1);
    console.log('deleteInventory() in service'+JSON.stringify(obj))
    return new Promise<any>((resolve, reject) => {
      if (obj.labeleddate == '' || obj.barcode == '' ) {

        return reject('Inventory to be deleted hasnull value or key is not defined');
      }
      obj.key = obj.labeleddate;
      let path1 = this.basefolder+"/"+obj.barcode+"/";
      console.log('deleteInventory service path='+path1)
      return this.commonService.delete(path1, obj);
      
    });
    
  }

  
  getAllInventory() {
    //console.log("getAllOutwardSales called", JSON.stringify(this.outwardSales));
    return this.commonService.getList(this.basefolder+'/');
  }

  

}

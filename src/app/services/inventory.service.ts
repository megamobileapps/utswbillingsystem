import { Injectable } from '@angular/core';
import { ALL_GST, ALL_BUYERS, ALL_HSNS, ALL_GST_TYPES, ALL_VENDORS, EXPENSE_HEAD, EXPENSE_CAT } from '../data/data';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { CommonService } from './common.service';
import { HttpClient } from '@angular/common/http';
import { InventoryItem } from '../models/inoffice';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  basefolder : any = '/in/ci/inventory';
  private readonly valid_user = "9999";

  private inventoryCache: InventoryItem[] = [];
  public isCacheReady = new BehaviorSubject<boolean>(false);

  constructor(public commonService: CommonService,
              private http: HttpClient) {
  }

  setbasefolder(in_basefolder:any) {
    this.basefolder =  in_basefolder;
  }

  getbasefolder() {
    return this.basefolder;
  }
  
  loadInventoryCache(): void {
    if (this.inventoryCache.length > 0) {
      this.isCacheReady.next(true);
      return;
    }

    this.getAllInventory().subscribe(data => {
      const rcvddata: InventoryItem[] = [];
      for (const item of data) {
        if (item && item.itemdetails) {
          rcvddata.push(item.itemdetails as InventoryItem);
        }
      }
      this.inventoryCache = rcvddata;
      this.isCacheReady.next(true);
      console.log('Inventory cache populated with', this.inventoryCache.length, 'items.');
    });
  }

  getInventoryCache(): InventoryItem[] {
    return this.inventoryCache;
  }

  addInventory(data: any) {
    if (localStorage.getItem('user')) {
      let user:Record<string,string> = JSON.parse(localStorage.getItem('user')??"")
      if (user["username"] == this.valid_user) {
        if(typeof data.id === 'undefined'  || data.id === '' || data.id == null )
          data.id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 12);
          data.key = data.id;
          // Invalidate cache on add
          this.inventoryCache = [];
          this.isCacheReady.next(false);
          
          const path = `${this.basefolder}/${data.itemdetails.barcode}/${data.itemdetails.labeleddate}/`;
          
          return this.commonService.add(path, data);
        }
    }
    return Promise.reject(new Error("Not valid user to performa action"));
  }

  
  deleteInventory(obj: any) {
    return new Promise<any>((resolve, reject) => {
      if (typeof obj.id === 'undefined') {
        return reject('Inventory to be deleted has no ID defined');
      }
      // Invalidate cache on delete
      this.inventoryCache = [];
      this.isCacheReady.next(false);
      return this.commonService.delete(this.basefolder, obj);
    });
  }

  
  getAllInventory() : Observable<any[]> {
    if (localStorage.getItem('user')) {
      let user:Record<string,string> = JSON.parse(localStorage.getItem('user')??"")
      if (user["username"] == this.valid_user) {
        return this.commonService.getList(this.basefolder+'/');
      }
    }
    return of([]);
  }
}

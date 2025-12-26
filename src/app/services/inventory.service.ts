import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CommonService } from './common.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  basefolder: any = '/in/ci/inventory';
  private readonly valid_user = "9999";

  constructor(public commonService: CommonService,
              private http: HttpClient) {
  }

  setbasefolder(in_basefolder: any) {
    this.basefolder = in_basefolder;
  }

  getbasefolder() {
    return this.basefolder;
  }

  addInventory(data: any) {
    if (localStorage.getItem('user')) {
      let user: Record<string, string> = JSON.parse(localStorage.getItem('user') ?? "")
      if (user["username"] == this.valid_user) {
        if (typeof data.id === 'undefined' || data.id === '' || data.id == null)
          data.id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 12);
        data.key = data.id;

        const path = `${this.basefolder}/${data.itemdetails.barcode}/${data.itemdetails.labeleddate}/`;
        
        return this.commonService.add(path, data);
      }
    }
    return Promise.reject(new Error("Not valid user to perform action"));
  }

  deleteInventory(obj: any) {
    return new Promise<any>((resolve, reject) => {
      if (typeof obj.id === 'undefined') {
        return reject('Inventory to be deleted has no ID defined');
      }
      return this.commonService.delete(this.basefolder, obj);
    });
  }

  getAllInventory(): Observable<any[]> {
    if (localStorage.getItem('user')) {
      let user: Record<string, string> = JSON.parse(localStorage.getItem('user') ?? "")
      if (user["username"] == this.valid_user) {
        return this.commonService.getList(this.basefolder + '/');
      }
    }
    return of([]);
  }
}

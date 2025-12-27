import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { Observable, of } from 'rxjs';

@Injectable()
export class CommonService {
  //basePath:string=""
  constructor(
   private apiService: ApiService,
   private http: HttpClient
 ) { }

 getOne(basepath: string, obj: any=null): Observable<any>|undefined {
   if(obj != null && typeof obj != 'undefined') {
        console.log('OBJ in getEvent:', obj);
        // return this.afDb.object(basepath+obj.key).valueChanges(); // Firebase code commented out
        return this.apiService.get(`${basepath}/${obj.key}`); // Using ApiService
      }
    return undefined;
 }

  getList(basepath: string, obj: any=null): Observable<any[]> {
    // const retData = new Array<any>(); // Firebase related code commented out
    // const ref = null; // Firebase related code commented out
    console.log("common service: basepath"+basepath);
    if(obj != null && typeof obj !== 'undefined') {
        console.log('OBJ in getEvent:', obj);
        // return this.afDb.list(basepath + obj.key).valueChanges(); // Firebase code commented out
        return this.apiService.get(`${basepath}/${obj.key}`); // Using ApiService
      } else {
        // return this.afDb.list(basepath).valueChanges(); // Firebase code commented out
        return this.apiService.get(basepath); // Using ApiService
      }
    // return of([]); // Firebase related code commented out
  }

  add(basepath: string, data: any): Promise<any> {
    const path = basepath; // Simplified: addInventory now constructs the full path
    console.log('common service -> add() path:', path);
    console.log('common service -> add() data:', JSON.stringify(data));
    return new Promise<any>((resolve, reject) => {
      //firebase.database().ref(path).set(data) // Firebase code commented out
      // this.afDb.object(path).set(data) // Firebase code commented out
      this.apiService.post(path, data) // Using ApiService
      .subscribe(
        result => {
          return resolve('Add Successful');
        },
        err => {
          return reject(err);
        }
      );
    });
  }

  update(basepath: string, data: any): Promise<any> {
    const path = (typeof data.key !== 'undefined' ? basepath + data.key : basepath);
    return new Promise<any>((resolve, reject) => {
      //firebase.database().ref(path).update(data) // Firebase code commented out
      // this.afDb.object(path).update(data) // Firebase code commented out
      this.apiService.put(path, data) // Using ApiService
      .subscribe(
        result => {
          return resolve('Update Successful');
        },
        err => {
          return reject(err);
        }
      );
    });
  }
  delete(basepath: string, dataObj: any): Promise<any> {
    console.log('delete event:', dataObj);
    return new Promise<any>((resolve, reject) => {
      if (null == dataObj || typeof dataObj.id === 'undefined') {

        return reject('Object passed is null or id is not defined');
      }
      this.apiService.delete(`${basepath}/${dataObj.id}/`) // Using ApiService
      .subscribe(
        result => {
          if (result.status === 204) {
            return resolve('Delete Successful');
          }
          return resolve('Delete Successful');
        },
        err => {
          return reject(err);
        }
      );
    });
  }
}
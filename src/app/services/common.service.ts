import { Injectable } from "@angular/core";
//import 'rxjs/add/operator/toPromise';
//import { AngularFirestore } from 'angularfire2/firestore';
// import { AngularFireAuth } from 'angularfire2/auth';
// import { AngularFireDatabase } from 'angularfire2/database';

import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import * as firebase from 'firebase/app';
//import {EventStruct} from './../app/app.interface';
import { Observable, of } from 'rxjs';

@Injectable()
export class CommonService {
  //basePath:string=""
  constructor(
   public afDb: AngularFireDatabase,
   public afAuth: AngularFireAuth
 ) {
 }


 getOne(basepath: string, obj: any=null): Observable<any>|undefined {
   if(obj != null && typeof obj != 'undefined') {
        console.log('OBJ in getEvent:', obj);
        return this.afDb.object(basepath+obj.key).valueChanges();
      }
    return undefined;
 }

  getList(basepath: string, obj: any=null): Observable<any[]> {
    const retData = new Array<any>();
    const ref = null;
    console.log("common service: basepath"+basepath);
    if(obj != null && typeof obj !== 'undefined') {
        console.log('OBJ in getEvent:', obj);
        return this.afDb.list(basepath + obj.key).valueChanges();
      } else {
        return this.afDb.list(basepath).valueChanges();

      }
    return of([]);

  }

  add(basepath: string, data: any): Promise<any> {
    const path = (typeof data.key !== 'undefined' ? basepath + data.key : basepath);
    console.log('common service -> add() path:', path);
    console.log('common service -> add() data:', JSON.stringify(data));
    return new Promise<any>((resolve, reject) => {
      //firebase.database().ref(path).set(data)
      this.afDb.object(path).set(data)
      .then(
        result => {
          return resolve('Add Successful');
        })
      .catch(
        err => {
          return reject(err);
        });
    });
  }

  update(basepath: string, data: any): Promise<any> {
    const path = (typeof data.key !== 'undefined' ? basepath + data.key : basepath);
    return new Promise<any>((resolve, reject) => {
      //firebase.database().ref(path).update(data)
      this.afDb.object(path).update(data)
      .then(
        result => {
          return resolve('Update Successful');
        })
      .catch(
        err => {
          return reject(err);
        });
    });
  }
  delete(basepath: string, dataObj: any): Promise<any> {
    console.log('delete event:', dataObj);
    return new Promise<any>((resolve, reject) => {
      if (null == dataObj || typeof dataObj.key === 'undefined') {

        return reject('Object passed is null or key is not defined');
      }
      const ref = this.afDb.object(basepath + dataObj.key) ;//firebase.database().ref(basepath + dataObj.key);
      
      return ref.update({});
      
    }
    )};
}

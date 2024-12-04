import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { User } from '../../models/utswuser';

@Injectable({ providedIn: 'root' })
export class AuthService {
    loginUrl = '/in/ci/Login/posoperator/';
 
  
    private userSubject: BehaviorSubject<User>|null=null;
    public user: Observable<User>|null = null;
    redirectUrl:string|null=null;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
      let x = localStorage.getItem('user');
        if(x){
          this.userSubject = new BehaviorSubject<User>(JSON.parse(x));
          this.user = this.userSubject.asObservable();
      }
    }

    public get userValue(): User|null {
        return this.userSubject?this.userSubject.value:null;
    }

    login(username: string, password: string) {
      //${environment.apiUrl}/users/authenticate
      //C:\xampp\htdocs\in\usershopaccount\printedSchoolRates.json.php
        return this.http.post<any>(environment.apiBackend+this.loginUrl, { username, password })
        // return this.http.post<any>(`http://localhost/in/usershopaccount/printedSchoolRates.json.php`, { username, password })
            .pipe(map(user => {
                // store user details and basic auth credentials in local storage to keep user logged in between page refreshes
                // user.authdata = window.btoa(username + ':' + password);
                localStorage.setItem('user', JSON.stringify(user));
                if(this.userSubject == null){
                  this.userSubject = new BehaviorSubject<User>(user);
                  this.user = this.userSubject.asObservable();
                }else{
                  this.userSubject!.next(user);
                }
                return user;
            }));
    }
    

    logout(redirectUrl:string='') {
        // remove user from local storage to log user out
        console.log('logout called in auth service');
        localStorage.removeItem('user');
        let emptyUser:User = {id: -1,
          username: '',
          password: '',
          firstName: '',
          lastName: '',
          email:'',
          phone:'',
          authdata: ''};
        this.userSubject?.next(emptyUser);
        this.router.navigate(['/login'],{queryParams:{returnUrl:redirectUrl}});
    }

    private handleError(error: HttpErrorResponse) {
      if (error.status === 0) {
        // A client-side or network error occurred. Handle it accordingly.
        console.error('While registration An error occurred:', error.error);
      } else {
        // The backend returned an unsuccessful response code.
        // The response body may contain clues as to what went wrong.
        console.error(
          `While registration Backend returned code ${error.status}, body was: `, error);
      }
      // Return an observable with a user-facing error message.
      return throwError(() => new Error('While registration Something bad happened; please try again later.'));
    }
    
    
}
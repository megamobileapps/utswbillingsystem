import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { User } from '../models/utswuser';

@Injectable({ providedIn: 'root' })
export class AuthService {
    loginUrl = '/in/ci/Login';
    registerUrl = '/in/ci/Register';
    fgpswdUrl = '/in/ci/Authv2/fgpswd';
    changepswdUrl = '/in/ci/Authv2/changepswd';
    verifyotpUrl = '/in/ci/Otp';
    generateotpurl = '/in/ci/Otp';
  
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
    generateotp(mobileno: string) {
      let optype:string='mobileloginops';
      let genotp='1';
      //${environment.apiUrl}/users/authenticate
      //C:\xampp\htdocs\in\usershopaccount\printedSchoolRates.json.php
        return this.http.post<any>(environment.apiBackend+this.generateotpurl, { mobileno, optype, genotp })
        // return this.http.post<any>(`http://localhost/in/usershopaccount/printedSchoolRates.json.php`, { username, password })
            .pipe(map(user => {
                
                return user;
            }));
    }
    verifyotp(mobileno: string, otp: string) {
      
      let optype:string='mobileloginops';
      let genotp='0';
        return this.http.post<any>(environment.apiBackend+this.verifyotpUrl, { mobileno, otp, optype, genotp})
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
    
    //Register
    // post to loginNRegister/register.php?_mobileinterface=1 register
    register(registrationFormData:any):Observable<User|Error> {
      //return this.http.post<any>(`${environment.apiUrl}/loginNRegister/register.php?_mobileinterface=1`, 
     
      return this.http.post<any>(environment.apiBackend+this.registerUrl, 
        registrationFormData)
        // .pipe(
        //   catchError(this.handleError)
        // );
        // .pipe(tap({
        //   next:(data)=>console.log('data in registration:authService',data),
        //   error:(error)=>console.log('error in registration:authService,error', error)
        // }));
          .pipe(map(user => {
              // store user details and basic auth credentials in local storage to keep user logged in between page refreshes
              // user.authdata = window.btoa(registrationFormData.userName + ':' + registrationFormData.password);
              localStorage.setItem('user', JSON.stringify(user.user));
              if(this.userSubject == null){
                this.userSubject = new BehaviorSubject<User>(user.user);
                this.user = this.userSubject.asObservable();
              }else{
                this.userSubject!.next(user.user);
              }
              return user.user;
          }));
  }

  // Forgot password
  /*
  var responsePromise = $.post(newSitePath+"fg.php", dataObject, {
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: transformRequest_local
    });
  */
  forgotPswd(forgotPswdFormData:any):Observable<User|Error> {
    return this.http.post<any>(`${environment.apiBackend}${this.fgpswdUrl}`, 
    forgotPswdFormData)
        .pipe(map(user => {
            return user;
        }));
  }
  //changepswd
  changepswd(changePswdFormData:any):Observable<User|Error> {
    return this.http.post<any>(`${environment.apiBackend}${this.changepswdUrl}`, 
    changePswdFormData)
        .pipe(map(user => {
            return user;
        }));
  }
}
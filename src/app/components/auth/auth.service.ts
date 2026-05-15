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
    public redirectUrl: string | null = null;
  
    private userSubject: BehaviorSubject<User>|null;
    public user: Observable<User>|null;
    private selectedStoreIdSubject: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);
    public selectedStoreId$: Observable<number | null> = this.selectedStoreIdSubject.asObservable();

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        let x = localStorage.getItem('user');
        const initialUser = x ? JSON.parse(x) : { id: -1, username: '' };
        this.userSubject = new BehaviorSubject<User>(initialUser);
        this.user = this.userSubject.asObservable();

        // Initialize selected store from localStorage or user profile
        const savedStoreId = localStorage.getItem('selectedStoreId');
        if (savedStoreId) {
            this.selectedStoreIdSubject.next(parseInt(savedStoreId, 10));
        } else if (initialUser && initialUser.store_id) {
            this.selectedStoreIdSubject.next(initialUser.store_id);
        }
    }

    public get userValue(): User | null {
        return this.userSubject ? this.userSubject.value : null;
    }

    public get selectedStoreId(): number | null {
        return this.selectedStoreIdSubject.value;
    }

    public setStoreContext(storeId: number | null) {
        if (storeId) {
            localStorage.setItem('selectedStoreId', storeId.toString());
        } else {
            localStorage.removeItem('selectedStoreId');
        }
        this.selectedStoreIdSubject.next(storeId);
    }

    login(username: string, password: string) {
        return this.http.post<any>(environment.apiBackend + this.loginUrl, { username, password })
            .pipe(map(user => {
                localStorage.setItem('user', JSON.stringify(user));
                this.userSubject!.next(user);

                // Default context to user's assigned store on login
                if (user.store_id) {
                    localStorage.setItem('selectedStoreId', user.store_id.toString());
                    this.selectedStoreIdSubject.next(user.store_id);
                }

                return user;
            }));
    }

    logout(redirectUrl:string='') {
        // remove user from local storage to log user out
        console.log('logout called in auth service');
        localStorage.removeItem('user');
        localStorage.removeItem('selectedStoreId');
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

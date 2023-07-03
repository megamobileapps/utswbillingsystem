import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../components/auth/auth.service';


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthService, 
        private router: Router,
        private route: ActivatedRoute) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            // console.log('ErrorInterceptor:Error received---'+JSON.stringify(err));
            // console.log('[1] Referer in ErrorInterceptor is '+this.router.routerState.snapshot.url);
            // console.log('[2] Referer in ErrorInterceptor is '+JSON.stringify(this.route.queryParams));
            
            let url = `${this.router.routerState.snapshot.url}`;
            let link = `${url.split('?')[0]}`;
            let full_link = link;
            // console.log('[3] url'+this.router.routerState.snapshot.url);
            this.route.queryParams.forEach(x=>{
                // console.log('typeof'+(typeof x)+' queryparam'+JSON.stringify(x));
                let keys = Object.keys(x);
                keys.forEach((key, index)=>{
                    if(index>0){
                        full_link = full_link +'&';
                    }else {
                        full_link = full_link + '?';
                    }
                    full_link = full_link + key + '=' +x[key];
                })
            });
            // console.log('[4] url'+url+' full_link='+full_link);
            if (err.status === 401) {
                // auto logout if 401 response returned from api
                this.authenticationService.logout(url);
            }else if(err.error.message == "Expired token") {
                alert("Last Login has expired. Please Relogin.");
                this.authenticationService.logout(url);
            }

            const error = err.error.message || err.statusText;
            return throwError(error);
        }))
    }
}
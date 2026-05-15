import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { FormControl,FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { Location } from '@angular/common'

import { AuthService } from '../auth.service';
import { Title } from '@angular/platform-browser';
declare var gtag: Function;
@Component({ templateUrl: 'login.component.html' })
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    
    loading = false;
    submitted = false;
    submittedwithotp = false;
    submittedforotp = false;
    returnUrl: string|null|undefined=null;
    error = '';

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        private location: Location,
        private titleService:Title
    ) { 
        // redirect to home if already logged in
        this.titleService.setTitle("UpToSchoolWorksheets Login");
        this.router.events.subscribe((event) => {
                 
          });
        this.loginForm = this.formBuilder.group({
          username: ['', Validators.required],
          password: ['', Validators.required]
      });
      
        if (this.authService.userValue && this.authService.userValue.id != -1) { 
            this.router.navigate([this.authService.redirectUrl||'/catalogue']);
        }
    }
    localunescape(htmlInput:string|null|undefined) { 
        htmlInput = htmlInput?.replace("%3F", "?");
        htmlInput = htmlInput?.replace("%3D", "=");
        htmlInput = htmlInput?.replace("&amp;", "&");
        return htmlInput;
    } 

    ngOnInit() {
        

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/catalogue';
        this.returnUrl = this.localunescape(this.returnUrl);
        // console.log('login component ngOninit(): returnurl', this.returnUrl);
    }

    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }
    

    getQueryParams(link:string|null|undefined){
        if(!link || link == null){
            return {};
        }
        var retVal  = {};
        let paramArray = link?.split('?');
        if(paramArray?.length>1){
            let pa = link?.split('?')[1];
            let pv = pa.split('&');
            pv.forEach(pvi=>{
                let nv = pvi.split('=');
                if(nv.length > 0){
                    // retVal[nv[0]] = nv[1];
                }
            });
        }
        return JSON.parse(JSON.stringify(retVal));
    }
    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.loginForm.invalid) {
          console.log("Login form is invalid");
            return;
        }

        this.loading = true;
        this.authService.login(this.f['username'].value, this.f['password'].value)
            .pipe(first())
            .subscribe(
                data => {
                  console.log("login component:logged in data received:", data);
                  this.loading = false;
                  
                  // Check for explicit redirect URL or use default
                  const redirect = this.authService.redirectUrl || '/catalogue';
                  console.log("login component: navigating to:", redirect);
                  this.router.navigateByUrl(redirect);
                },
                error => {
                    this.error = error;
                    this.loading = false;
                });
    }

    

    
}
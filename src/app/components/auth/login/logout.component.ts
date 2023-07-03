import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl,FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthService } from '../auth.service';

@Component({ templateUrl: 'logout.component.html' })
export class LogoutComponent implements OnInit {
    
    returnUrl: string|null=null;
    error = '';

    constructor(
        
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService
    ) { 
        // redirect to home if already logged in
        
        // if (this.authService.userValue) { 
        //     this.router.navigate(['/download/worksheet']);
        // }
    }

    ngOnInit() {
        

        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/login';
        this.authService.logout();
    }

    // convenience getter for easy access to form fields
    

    
}
import {FormGroup, FormControl, Validators, ReactiveFormsModule, FormBuilder, FormArray } from '@angular/forms';
import { GstAmountPercentageJson } from './gst-amount-percentage';



export class Outwardsaletype {
        id = [''];
        saledate =['01/08/2019', Validators.required];
        saleto = ['POS', Validators.required];
        grossvalue = ['', Validators.required];
        totaltaxcollected = [0];
        invoiceno = [''];
        paymentsource = ['swipe', Validators.required];
        message = [''];
        salequantity=[0];
        gstarray: FormArray = new FormArray<any>([]);//any;//GstAmountPercentage[];

        constructor() {
        //     //this.gstArray = [new GstAmountPercentage()];
        }
}


export interface OutwardsaletypeJson {
        id:string;
        key:string;
        saledate:string;
        saleto:string;
        grossvalue:string;
        totaltaxcollected:string;
        paymentsource:string;
        invoiceno:string;
        message:string;
        salequantity:string;
        gstarray: Array<GstAmountPercentageJson>;
}

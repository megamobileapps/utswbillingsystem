import { Injectable } from '@angular/core';
import { ALL_GST, ALL_BUYERS, ALL_HSNS, ALL_GST_TYPES, ALL_VENDORS, EXPENSE_HEAD, EXPENSE_CAT } from '../data/data';
import { Observable, from, of } from 'rxjs';
import { CommonService } from './common.service';
import { OutwardsaletypeJson } from '../models/outwardsaletype';
// import { InwardpurchasetypeJson } from '../types/inwardpurchasetype';
// import { ExpenseTypeJson } from '../types/expesnetype';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SaleservicesService {
  outwardSales: Array<any> = [];
  inwardpurchases: Array<any> = [];
  expenses: Array<any> = [];
  basefolder : any = '/fy2021';
  constructor(public commonService: CommonService,
              private http: HttpClient) {
              // this.commonService.getList(this.basefolder+'/expenses/')
              // .subscribe(data => {
              //   console.log("data received for expense", data);
              //   if(null != data) {
              //    this.expenses = data;
              //   }
              // });
  }

  setbasefolder(in_basefolder:any) {
    this.basefolder =  in_basefolder;
  }

  getbasefolder() {
    return this.basefolder;
  }
  getGSTs() {
    return of(ALL_GST);
  }

  getGSTTypes() {
    return of(ALL_GST_TYPES);
  }


  getAllBuyers() {
    return of(ALL_BUYERS);
  }

  getAllVendors() {
    return of(ALL_VENDORS);
  }
  getAllHSNS() {
    return of(ALL_HSNS);
  }

  

  addOutwardSale(data: any) {
    if(typeof data.id === 'undefined'  || data.id === '' || data.id == null )
      data.id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 12);
    //this.outwardSales.push(data);
    console.log("outwards sale added:",JSON.stringify(data));
    data.key = data.id;
    
    return this.commonService.add(this.basefolder+"/outwardsale/", data);
  }

  addSaleInvoice(data: any) {
    if(typeof data.id === 'undefined'  || data.id === '' || data.id == null )
      data.id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 12);
    //this.outwardSales.push(data);
    console.log("outwards POS sale added:",JSON.stringify(data));
    data.key = data.id;
    
    return this.commonService.add(this.basefolder+"/outwardpossale/", data);
  }

  deleteOutwardSale(obj: OutwardsaletypeJson) {
    //this.outwardSales.splice(idx, 1);
    return this.commonService.delete(this.basefolder+"/outwardsale/", obj);
  }

  
  getAllOutwardSales() {
    //console.log("getAllOutwardSales called", JSON.stringify(this.outwardSales));
    return this.commonService.getList(this.basefolder+'/outwardsale/');
  }

  

  getAllIPOSInvoices() {
    //console.log("getAllInwardspurchases called", JSON.stringify(this.inwardpurchases));
    //return this.inwardpurchases;
    return this.commonService.getList(this.basefolder + '/outwardpossale/');
  }

  //baseUrl = 'http://localhost/in';
  baseUrl = 'https://www.uptoschoolworksheets.com/in';
  getAllPrintRates() {
    let params = new HttpParams();
       params = params.append('username', 'executive');
       params = params.append('passwd', '47ladug');
       params = params.append('printed', '2');

    // let body = new URLSearchParams();
    // body.set('username', 'executive');
    // body.set('passwd', '47ladug');
    // body.set('printed', '2');


    let options = {
        headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
    };

    return this.http.post(this.baseUrl + '/usershopaccount/GetWorksheetsRate.php', params.toString(), options);
  }

  addPOSEntryInSiteDB(data: any) {
    if(typeof data.id === 'undefined'  || data.id === '' || data.id == null )
      data.id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 12);
    //this.outwardSales.push(data);
    console.log("outwards POS sale to SITE DB added:",JSON.stringify(data));
    data.key = data.id;

    let params = new HttpParams();
    params = params.append('posoperation','addinvoice'); // request operation type
    params = params.append('posuserid', '9999'); 
    params = params.append('posuserpswd', '8888');

    params = params.append('username', (data.saleto ? data.saleto:'shiffauli'));
    params = params.append('phonenumber', (data.saletophone ? data.saletophone : '9611146.74'));
    params = params.append('emailid', (data.saletoemail ? data.saletoemail : ''));
    params = params.append('invoicenumber', data.invoiceno);
    params = params.append('invoicedate', (new Date().toISOString().slice(0, 10)));
    params = params.append('invoicedata', JSON.stringify(data.saleitemarray));
    params = params.append('invoiceamount', data.netvalue);
    
    let options = {
        headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
    };

    return this.http.post(this.baseUrl + '/usershopaccount/dobill.php', params.toString(), options);
  }
}

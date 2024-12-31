import { Injectable } from "@angular/core";
import { Observable, catchError, map, of, tap } from "rxjs";
import { InOfficeCat, InOfficePrice } from "../models/inoffice";
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { MessageService } from "./message.service";
import { environment } from "src/environments/environment";
import { param } from "jquery";
import { InvoiceDataItem, InvoiceSoldItems } from "../models/invoice-data-item";

@Injectable({
    providedIn: 'root'
  })
  
  export class DataService {
    inofficeratesurl= '/in/ci/inofficerates';
    inofficecatsurl='/in/ci/inofficerates/grades';
    saveBillUrl='/in/ci/Posinvoice/add/'; //TODO v1 url
    getBillUrl='/in/ci/Posinvoice'; //TODO v1 url
    addItemUrl='/in/ci/Inofficerates/additem/';//add item in inofficerate
    getsoldinventoryitemsbackend='/in/ci/analyze/get_all_inventory_sold_items/';//add item in inofficerate
    private readonly valid_user = "9999";

    httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' })
      };
      constructor(private _http:HttpClient,
        private messageService: MessageService) { }
      /**
     * Handle Http operation that failed.
     * Let the app continue.
     *
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
     */
    log(message:any){
      this.messageService.add(`HeroService: ${message}`);
    }
    private handleError<T>(operation = 'operation', result?: T) {
      return (error: any): Observable<T> => {
    
        // TODO: send the error to remote logging infrastructure
        console.error(error); // log to console instead
    
        // TODO: better job of transforming error for user consumption
        this.log(`${operation} failed: ${error.message}`);
    
        // Let the app keep running by returning an empty result.
        return of(result as T);
      };
    }
    getOfficeRates() :Observable<InOfficePrice[]> {
    return this._http.get<InOfficePrice[]>(environment.apiBackend+this.inofficeratesurl).pipe(
      tap(_ => this.log('fetched getOfficeRates')),
      catchError(this.handleError<InOfficePrice[]>('getOfficeRates', []))
    );
  }
  getInofficeCategories():Observable<InOfficeCat[]> {
    return this._http.get<InOfficeCat[]>(environment.apiBackend+this.inofficecatsurl).pipe(
      tap(_ => this.log('fetched getInofficeCategories')),
      catchError(this.handleError<InOfficeCat[]>('getInofficeCategories', []))
    );
  }

  getInvoiceDataFromServer(invoicestartdate:string, invoiceenddate:string) :Observable<InvoiceDataItem[]> {
    if (localStorage.getItem('user')) {
      let user:Record<string,string> = JSON.parse(localStorage.getItem('user')??"")
      console.log(`Data service user details are : ${user}`)
      if (user["username"] == this.valid_user) {
        let params = new HttpParams();
          params = params.append('posuserid', '9999');
          params = params.append('posuserpswd', '8888');
          params = params.append('invoicedate', invoicestartdate);
          params = params.append('invoiceenddate', invoiceenddate);

        let params_string = params.toString();
        console.log('Service getInvoiceDataFromServer() ' + params_string);

        let options = {
            headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
            
        };
        return this._http.get<InvoiceDataItem[]>(environment.apiBackend+this.getBillUrl+'?'+params_string, options).pipe(
          tap(_ => this.log('fetched getInvoiceDataFromServer')),
          catchError(this.handleError<InvoiceDataItem[]>('getInvoiceDataFromServer', []))
        );
      }
    }
    //Error scenario
    return of([]);

  }

  getInvoiceDataFromServer_with_invoiceid(invoiceid:string) :Observable<InvoiceDataItem[]> {
    if (localStorage.getItem('user')) {
      let user:Record<string,string> = JSON.parse(localStorage.getItem('user')??"")
      console.log(`Data service user details are : ${user}`)
      if (user["username"] == this.valid_user) {
        let params = new HttpParams();
          params = params.append('posuserid', '9999');
          params = params.append('posuserpswd', '8888');
          params = params.append('invoiceid', invoiceid);
          

        let params_string = params.toString();
        console.log('Service getInvoiceDataFromServer_with_invoiceid() ' + params_string);

        let options = {
            headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
            
        };
        return this._http.get<InvoiceDataItem[]>(environment.apiBackend+this.getBillUrl+'?'+params_string, options).pipe(
          tap(_ => this.log('fetched getInvoiceDataFromServer_with_invoiceid')),
          catchError(this.handleError<InvoiceDataItem[]>('getInvoiceDataFromServer_with_invoiceid', []))
        );
      }
    }
    //Error scenario
    return of([]);

  }

  saveInvoiceDataOnServer(data:any){
    return this._http.post<any>(`${environment.apiBackend}${this.saveBillUrl}`,
                               { data })
            .pipe(map(dmap => {
                return dmap;
            }));
  }

  addItem(data:any){
    return this._http.post<any>(`${environment.apiBackend}${this.addItemUrl}`,
                               { data })
            .pipe(map(dmap => {
                return dmap;
            }));
  }

  //Invoice sold items data
  //invoicestartdate and invoiceenddate are not used in backend
  // If you want them to be used then send extra parameter userdatefilter by setting value as "1"
  getInvoiceSoldItemsFromServer(invoicestartdate:string, invoiceenddate:string) :Observable<InvoiceSoldItems[]> {
    let params = new HttpParams();
       params = params.append('posuserid', '9999');
       params = params.append('posuserpswd', '8888');
       params = params.append('invoicestartdate', invoicestartdate);
       params = params.append('invoiceenddate', invoiceenddate);

    let params_string = params.toString();
    console.log('Service getInvoiceSoldItemsFromServer() ' + params_string);

    let options = {
        headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
        
    };
    return this._http.get<InvoiceSoldItems[]>(environment.apiBackend+this.getsoldinventoryitemsbackend+'?'+params_string, options).pipe(
      tap(_ => this.log('fetched getInvoiceSoldItemsFromServer')),
      catchError(this.handleError<InvoiceSoldItems[]>('getInvoiceSoldItemsFromServer', []))
    );

  }
}
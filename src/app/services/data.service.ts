import { Injectable } from "@angular/core";
import { Observable, catchError, map, of, tap } from "rxjs";
import { InOfficeCat, InOfficePrice } from "../models/inoffice";
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { MessageService } from "./message.service";
import { environment } from "src/environments/environment";
import { param } from "jquery";
import { InvoiceDataItem } from "../models/invoice-data-item";

@Injectable({
    providedIn: 'root'
  })
  
  export class DataService {
    inofficeratesurl= '/in/ci/Inofficerates';
    inofficecatsurl='/in/ci/Inofficerates/grades';
    saveBillUrl='/in/ci/Posinvoice/add'; //TODO v1 url
    getBillUrl='/in/ci/Posinvoice'; //TODO v1 url
    addItemUrl='/in/ci/Inofficerates/additem';//add item in inofficerate

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

  getInvoiceDataFromServer(invoicedate:string) :Observable<InvoiceDataItem[]> {
    let params = new HttpParams();
       params = params.append('posuserid', '9999');
       params = params.append('posuserpswd', '8888');
       params = params.append('invoicedate', invoicedate);

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
}
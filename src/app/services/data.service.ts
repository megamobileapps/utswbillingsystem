import { Injectable } from "@angular/core";
import { Observable, catchError, map, of, tap } from "rxjs";
import { InOfficeCat, InOfficePrice } from "../models/inoffice";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MessageService } from "./message.service";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
  })
  
  export class DataService {
    inofficeratesurl= '/in/ci/Inofficerates';
    inofficecatsurl='/in/ci/Inofficerates/grades';
    saveBillUrl='/in/ci/Posinvoice/add'; //TODO v1 url
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